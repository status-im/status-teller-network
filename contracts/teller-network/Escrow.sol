/* solium-disable security/no-block-members */
/* solium-disable security/no-inline-assembly */

pragma solidity ^0.5.8;

import "../common/Ownable.sol";
import "../common/Pausable.sol";
import "../common/MessageSigned.sol";
import "../token/ERC20Token.sol";
import "./License.sol";
import "./MetadataStore.sol";
import "./Fees.sol";
import "./Arbitrable.sol";
import "tabookey-gasless/contracts/RelayRecipient.sol";

/**
 * @title Escrow
 * @dev Escrow contract for buying/selling ETH. Current implementation lacks arbitrage, marking trx as paid, and ERC20 support
 */
contract Escrow is Pausable, MessageSigned, Fees, Arbitrable, RelayRecipient {
    bytes4 private constant CREATE_SIGNATURE = bytes4(keccak256("create(bytes,uint256,uint256,uint8,uint256,bytes,string,string)"));
    bytes4 private constant PAY_SIGNATURE = bytes4(keccak256("pay(uint256)"));
    bytes4 private constant CANCEL_SIGNATURE = bytes4(keccak256("cancel(uint256)"));
    bytes4 private constant OPEN_CASE_SIGNATURE = bytes4(keccak256("openCase(uint256,string)"));

    constructor(
        address _license,
        address _arbitrationLicense,
        address _metadataStore,
        address _feeToken,
        address _feeDestination,
        uint _feeAmount)
        Fees(_feeToken, _feeDestination, _feeAmount)
        Arbitrable(_arbitrationLicense)
        public {
        license = License(_license);
        metadataStore = MetadataStore(_metadataStore);
    }

    function setRelayHubAddress(address _relayHub) public onlyOwner {
        set_relay_hub(RelayHub(_relayHub));
    }

    struct EscrowTransaction {
        uint256 offerId;
        uint256 tokenAmount;
        uint256 expirationTime;
        uint256 rating;
        uint256 tradeAmount;
        uint256 assetPrice;
        TradeType tradeType;
        EscrowStatus status;
        address payable buyer;
        address arbitrator;
    }

    enum TradeType {FIAT, CRYPTO}
    enum EscrowStatus {CREATED, FUNDED, PAID, RELEASED, CANCELED}

    EscrowTransaction[] public transactions;
    mapping(uint => uint[]) public transactionsByOfferId;

    License public license;
    MetadataStore public metadataStore;

    event Created(uint indexed offerId, address indexed seller, address indexed buyer, uint escrowId, uint date);
    event Funded(uint indexed escrowId, uint expirationTime, uint amount, uint date);

    event Paid(uint indexed escrowId, uint date);
    event Released(uint indexed escrowId, uint date);
    event Canceled(uint indexed escrowId, uint date);
    event Rating(uint indexed offerId, address indexed buyer, uint indexed escrowId, uint rating, uint date);


    mapping(address => uint) public lastActivity;

    function accept_relayed_call(address relay, address from, bytes memory encoded_function, uint gas_price,
      uint transaction_fee ) public view returns(uint32) {

        bytes4 fSign = abiDecodeFunctionSignature(encoded_function);

        if(fSign != CREATE_SIGNATURE && fSign != PAY_SIGNATURE && fSign != CANCEL_SIGNATURE && fSign != OPEN_CASE_SIGNATURE)
            return 11;

        // According to tests, 333450 is the cost of creating an escrow, so 500000 should be good
        if(from.balance > 500000 * gas_price) return 12;

        // Only allow trxs where the user is a buyer
        if(fSign == PAY_SIGNATURE || fSign == CANCEL_SIGNATURE || fSign == OPEN_CASE_SIGNATURE){
            bytes memory escrowBytes = slice(encoded_function, 4, 32);
            uint escrowId;
            assembly {
                escrowId := mload(add(escrowBytes, add(0x20, 0)))
            }
            if(escrowId >= transactions.length) return 13;
            if(transactions[escrowId].buyer != from) return 14;
            if(metadataStore.getAsset(transactions[escrowId].offerId) != address(0)) return 15; // Must be eth trx

            if(fSign == CANCEL_SIGNATURE){ // Allow activity after 15min have passed
                if((lastActivity[from] + 15 minutes) > block.timestamp) return 17;
            }
        } else if(fSign == CREATE_SIGNATURE) {
            bytes memory offerIdBytes = slice(encoded_function, 36, 32);
            uint offerId;
            assembly {
                offerId := mload(add(offerIdBytes, add(0x20, 0)))
            }
            if(metadataStore.getAsset(offerId) != address(0)) return 15; // Must be eth trx
            // Allow activity after 15 min have passed
            if((lastActivity[from] + 15 minutes) > block.timestamp) return 16;
        }

        return 0;
    }

    function canCreateOrCancel(address account) public view returns(bool) {
        return (lastActivity[account] + 15 minutes) < block.timestamp;
    }

    function post_relayed_call(address relay, address from,
        bytes memory encoded_function, bool success,
        uint used_gas, uint transaction_fee ) public {
        // nothing to be done post-call.
        // still, we must implement this method.
    }


    /**
     * @notice Create a new escrow
     * @param _signature buyer's signature
     * @param _offerId Offer
     * @param _tradeAmount Amount buyer is willing to trade
     * @param _tradeType Indicates if the amount is in crypto or fiat
     * @param _assetPrice Indicates the price of the asset in the FIAT of choice
     * @param _statusContactCode The address of the status contact code
     * @param _location The location on earth
     * @param _username The username of the user
     * @dev Requires contract to be unpaused.
     *         The seller needs to be licensed.
     */
    function create(
        bytes memory _signature,
        uint _offerId,
        uint _tradeAmount,
        uint8 _tradeType,
        uint _assetPrice,
        bytes memory _statusContactCode,
        string memory _location,
        string memory _username,
        uint _nonce
    ) public whenNotPaused returns(uint escrowId) {
        address payable _buyer = metadataStore.addOrUpdateUser(_signature, _statusContactCode, _location, _username, _nonce);
        lastActivity[_buyer] = block.timestamp;
        escrowId = _createTransaction(_buyer, _offerId, _tradeAmount, _tradeType, _assetPrice);
    }

    /**
     * @notice Fund a new escrow
     * @param _tokenAmount How much ether/tokens will be put in escrow
     * @param _expirationTime Unix timestamp before the transaction is considered expired
     * @dev Requires contract to be unpaused.
     *         The seller needs to be licensed.
     *         The expiration time must be at least 10min in the future
     *         For eth transfer, _amount must be equals to msg.value, for token transfer, requires an allowance and transfer valid for _amount
     */
    function fund(uint _escrowId, uint _tokenAmount, uint _expirationTime) external payable whenNotPaused {
        _fund(get_sender(), _escrowId, _tokenAmount, _expirationTime);
    }

    function _fund(address _from, uint _escrowId, uint _tokenAmount, uint _expirationTime) internal whenNotPaused {
        require(_expirationTime > (block.timestamp + 600), "Expiration time must be at least 10min in the future");
        require(license.isLicenseOwner(_from), "Must be a valid seller to fund escrow transactions");

        require(_from == metadataStore.getOfferOwner(transactions[_escrowId].offerId), "Only the seller can fund this escrow");
        require(transactions[_escrowId].status == EscrowStatus.CREATED, "Invalid escrow status");

        transactions[_escrowId].tokenAmount = _tokenAmount;
        transactions[_escrowId].expirationTime = _expirationTime;
        transactions[_escrowId].status = EscrowStatus.FUNDED;

        payFee(_from, _escrowId);

        address token = metadataStore.getAsset(transactions[_escrowId].offerId);

        if(token == address(0)){
            require(msg.value == _tokenAmount, "ETH amount is required");
        } else {
            require(msg.value == 0, "Cannot send ETH with token address different from 0");
            ERC20Token erc20token = ERC20Token(token);
            require(erc20token.allowance(_from, address(this)) >= _tokenAmount, "Allowance not set for this contract for specified amount");
            require(erc20token.transferFrom(_from, address(this), _tokenAmount), "Unsuccessful token transfer");
        }

        emit Funded(_escrowId, _expirationTime, _tokenAmount, block.timestamp);
    }

    /**
     * @notice Create and fund escrow
     * @param _buyer Buyer address
     * @param _offerId Offer id
     * @param _tradeAmount Amount buyer is willing to trade
     * @param _tradeType Indicates if the amount is in crypto or fiat
     * @param _assetPrice Indicates the price of the asset in the FIAT of choice
     * @param _tokenAmount How much ether/tokens will be put in escrow
     * @param _expirationTime Unix timestamp before the transaction is considered expired
     * @dev Requires contract to be unpaused.
     *         The seller needs to be licensed.
     *         The expiration time must be at least 10min in the future
     *         For eth transfer, _amount must be equals to msg.value, for token transfer, requires an allowance and transfer valid for _amount
     */
    function create_and_fund(
        address payable _buyer,
        uint _offerId,
        uint _tokenAmount,
        uint _expirationTime,
        uint _tradeAmount,
        uint8 _tradeType,
        uint _assetPrice
    ) external payable whenNotPaused {
        uint escrowId = _createTransaction(_buyer, _offerId, _tradeAmount, _tradeType, _assetPrice);
        _fund(get_sender(), escrowId, _tokenAmount, _expirationTime);
    }

    function _createTransaction(
        address payable _buyer,
        uint _offerId,
        uint _tradeAmount,
        uint8 _tradeType,
        uint _assetPrice
    ) internal returns(uint escrowId) {
        address seller = metadataStore.getOfferOwner(_offerId);
        address arbitrator = metadataStore.getArbitrator(_offerId);

        require(get_sender() == _buyer || get_sender() == seller, "Must participate in the trade");
        require(license.isLicenseOwner(seller), "Must be a valid seller to create escrow transactions");
        require(seller != _buyer, "Seller and Buyer must be different");
        require(arbitrator != _buyer, "Cannot buy offers where buyer is arbitrator");
        require(_tradeAmount != 0 && _assetPrice != 0, "Prices cannot be 0");

        escrowId = transactions.length++;

        transactions[escrowId].offerId = _offerId;
        transactions[escrowId].buyer = _buyer;
        transactions[escrowId].tradeAmount = _tradeAmount;
        transactions[escrowId].tradeType = TradeType(_tradeType);
        transactions[escrowId].assetPrice = _assetPrice;
        transactions[escrowId].arbitrator = arbitrator;

        transactionsByOfferId[_offerId].push(escrowId);

        emit Created(_offerId, seller, _buyer, escrowId, block.timestamp);
    }

    /**
     * @notice Release escrow funds to buyer
     * @param _escrowId Id of the escrow
     * @dev Requires contract to be unpaused.
     *      Can only be executed by the seller
     *      Transaction must not be expired, or previously canceled or released
     */
    function release(uint _escrowId) external {
        EscrowStatus mStatus = transactions[_escrowId].status;
        require(metadataStore.getOfferOwner(transactions[_escrowId].offerId) == get_sender(), "Only the seller can release the escrow");
        require(mStatus == EscrowStatus.PAID || mStatus == EscrowStatus.FUNDED, "Invalid transaction status");
        _release(_escrowId, transactions[_escrowId]);
    }

    /**
     * @dev Release funds to buyer
     * @param _escrowId Id of the escrow
     * @param trx EscrowTransaction with data of transaction to be released
     */
    function _release(uint _escrowId, EscrowTransaction storage trx) internal {
        trx.status = EscrowStatus.RELEASED;

        address token = metadataStore.getAsset(trx.offerId);
        if(token == address(0)){
            trx.buyer.transfer(trx.tokenAmount); // TODO: transfer fee to Status?
        } else {
            ERC20Token erc20token = ERC20Token(token);
            require(erc20token.transfer(trx.buyer, trx.tokenAmount), "Couldn't transfer funds");
        }

        emit Released(_escrowId, block.timestamp);
    }

    /**
     * @dev Seller/Buyer marks transaction as paid
     * @param _escrowId Id of the escrow
     * @param _sender Address marking the transaction as paid
     */
    function _pay(address _sender, uint _escrowId) internal {
        EscrowTransaction storage trx = transactions[_escrowId];

        require(trx.status == EscrowStatus.FUNDED, "Transaction is not funded");
        require(trx.expirationTime > block.timestamp, "Transaction already expired");
        require(trx.buyer == _sender || metadataStore.getOfferOwner(trx.offerId) == _sender,
                "Function can only be invoked by the escrow buyer or seller");

        trx.status = EscrowStatus.PAID;

        emit Paid(_escrowId, block.timestamp);
    }

    /**
     * @notice Mark transaction as paid
     * @param _escrowId Id of the escrow
     * @dev Can only be executed by the buyer
     */
    function pay(uint _escrowId) external {
        _pay(get_sender(), _escrowId);
    }

    /**
     * @notice Obtain message hash to be signed for marking a transaction as paid
     * @param _escrowId Id of the escrow
     * @return message hash
     * @dev Once message is signed, pass it as _signature of pay(uint256,bytes)
     */
    function paySignHash(uint _escrowId) public view returns(bytes32){
        return keccak256(
            abi.encodePacked(
                address(this),
                "pay(uint256)",
                _escrowId
            )
        );
    }

    /**
     * @notice Mark transaction as paid (via signed message)
     * @param _escrowId Id of the escrow
     * @param _signature Signature of the paySignHash result.
     * @dev There's a high probability of buyers not having ether to pay for the transaction.
     *      This allows anyone to relay the transaction.
     *      TODO: consider deducting funds later on release to pay the relayer (?)
     */
    function pay(uint _escrowId, bytes calldata _signature) external {
        address sender = recoverAddress(getSignHash(paySignHash(_escrowId)), _signature);
        _pay(sender, _escrowId);
    }

    /**
     * @dev Cancel an escrow operation
     * @param _escrowId Id of the escrow
     * @notice Requires contract to be unpaused.
     *         Can only be executed by the seller
     *         Transaction must be expired, or previously canceled or released
     */
    function cancel(uint _escrowId) external whenNotPaused {
        EscrowTransaction storage trx = transactions[_escrowId];

        EscrowStatus mStatus = trx.status;
        require(mStatus == EscrowStatus.FUNDED || mStatus == EscrowStatus.CREATED,
                "Only transactions in created or funded state can be canceled");

        address payable seller = metadataStore.getOfferOwner(trx.offerId);
        require(trx.buyer == get_sender() || seller == get_sender(), "Function can only be invoked by the escrow buyer or seller");

        if(trx.buyer == get_sender()){
            lastActivity[trx.buyer] = block.timestamp;
        }

        if(mStatus == EscrowStatus.FUNDED){
            if(get_sender() == seller){
                require(trx.expirationTime < block.timestamp, "Can only be canceled after expiration");
            }
        }

        _cancel(_escrowId, seller, trx);
    }

    /**
     * @dev Cancel transaction and send funds back to seller
     * @param _escrowId Id of the escrow
     * @param trx EscrowTransaction with details of transaction to be marked as canceled
     */
    function _cancel(uint _escrowId, address payable _seller, EscrowTransaction storage trx) internal {
        if(trx.status == EscrowStatus.FUNDED){
            address token = metadataStore.getAsset(trx.offerId);
            if(token == address(0)){
                _seller.transfer(trx.tokenAmount);
            } else {
                ERC20Token erc20token = ERC20Token(token);
                require(erc20token.transfer(_seller, trx.tokenAmount), "Transfer failed");
            }
        }

        trx.status = EscrowStatus.CANCELED;
        emit Canceled(_escrowId, block.timestamp);
    }

    /**
     * @dev Withdraws funds to the sellers in case of emergency
     * @param _escrowId Id of the escrow
     * @notice Requires contract to be paused.
     *         Can be executed by anyone
     *         Transaction must not be canceled or released
     */
    function withdraw_emergency(uint _escrowId) external whenPaused {
        EscrowTransaction storage trx = transactions[_escrowId];
        require(trx.status == EscrowStatus.FUNDED, "Cannot withdraw from escrow in a stage different from FUNDED. Open a case");
        
        address payable seller = metadataStore.getOfferOwner(trx.offerId);
        _cancel(_escrowId, seller, trx);
    }

    /**
    * @dev Fallback function
    */
    function() external {
    }

    /**
     * @dev Rates a transaction
     * @param _escrowId Id of the escrow
     * @param _rate rating of the transaction from 1 to 5
     * @notice Requires contract to not be paused.
     *         Can only be executed by the buyer
     *         Transaction must released
     */
    function rateTransaction(uint _escrowId, uint _rate) external whenNotPaused {
        require(_rate >= 1, "Rating needs to be at least 1");
        require(_rate <= 5, "Rating needs to be at less than or equal to 5");
        require(!isDisputed(_escrowId), "Can't rate a transaction that has an arbitration process");

        EscrowTransaction storage trx = transactions[_escrowId];

        require(trx.rating == 0, "Transaction already rated");
        require(trx.status == EscrowStatus.RELEASED, "Transaction not released yet");
        require(trx.buyer == get_sender(), "Function can only be invoked by the escrow buyer");

        trx.rating = _rate;

        emit Rating(trx.offerId, trx.buyer, _escrowId, _rate, block.timestamp);
    }


    /**
     * @notice Open case as a buyer or seller for arbitration
     * @param _escrowId Id of the escrow
     * @dev Consider using Aragon Court for this.
     */
    function openCase(uint _escrowId, string calldata motive) external {
        EscrowTransaction storage trx = transactions[_escrowId];

        require(!isDisputed(_escrowId), "Case already exist");
        require(trx.buyer == get_sender() || metadataStore.getOfferOwner(trx.offerId) == get_sender(), "Only a buyer or seller can open a case");
        require(trx.status == EscrowStatus.PAID, "Cases can only be open for paid transactions");

        openDispute(_escrowId, get_sender(), motive);
    }

    /**
     * @notice Open case as a buyer or seller for arbitration via a relay account
     * @param _escrowId Id of the escrow
     * @param _signature Signed message result of openCaseSignHash(uint256)
     * @dev Consider opening a dispute in aragon court.
     */
    function openCaseWithSignature(uint _escrowId, string calldata motive, bytes calldata _signature) external {
        EscrowTransaction storage trx = transactions[_escrowId];

        require(!isDisputed(_escrowId), "Case already exist");
        require(trx.status == EscrowStatus.PAID, "Cases can only be open for paid transactions");

        address senderAddress = recoverAddress(getSignHash(openCaseSignHash(_escrowId, motive)), _signature);

        require(trx.buyer == senderAddress || metadataStore.getOfferOwner(trx.offerId) == senderAddress,
                "Only a buyer or seller can open a case");

        openDispute(_escrowId, get_sender(), motive);
    }

    /**
     * @notice Set arbitration result in favour of the buyer or seller and transfer funds accordingly
     * @param _escrowId Id of the escrow
     * @param _releaseFunds Release funds to buyer or cancel escrow
     * @param _arbitrator Arbitrator address
     */
    function solveDispute(uint _escrowId, bool _releaseFunds, address _arbitrator) internal {
        EscrowTransaction storage trx = transactions[_escrowId];

        address payable seller = metadataStore.getOfferOwner(trx.offerId);

        require(trx.buyer != _arbitrator && seller != _arbitrator, "Arbitrator cannot be part of transaction");

        if(_releaseFunds){
            _release(_escrowId, trx);
        } else {
            _cancel(_escrowId, seller, trx);
        }
    }

    /**
     * @notice Get arbitrator
     * @param _escrowId Id of the escrow
     * @return Arbitrator address
     */
    function getArbitrator(uint _escrowId) public view returns(address) {
        return transactions[_escrowId].arbitrator;
    }


    /**
     * @notice Obtain message hash to be signed for opening a case
     * @param _escrowId Id of the escrow
     * @return message hash
     * @dev Once message is signed, pass it as _signature of openCase(uint256,bytes)
     */
    function openCaseSignHash(uint _escrowId, string memory motive) public view returns(bytes32){
        return keccak256(
            abi.encodePacked(
                address(this),
                "openCase(uint256)",
                _escrowId,
                motive
            )
        );
    }

    function getTransactionsIdByOfferId(uint _offerId) public view returns(uint[] memory) {
        return transactionsByOfferId[_offerId];
    }

    /**
     * @notice Support for "approveAndCall". Callable only by the fee token.
     * @param _from Who approved.
     * @param _amount Amount being approved, need to be equal `getPrice()`.
     * @param _token Token being approved, need to be equal `token()`.
     * @param _data Abi encoded data with selector of `register(bytes32,address,bytes32,bytes32)`.
     */
    function receiveApproval(address _from, uint256 _amount, address _token, bytes memory _data) public {
        require(_amount >= feeAmount, "Amount should include fee");
        require(_token == address(feeToken), "Wrong token");
        require(_token == address(get_sender()), "Wrong call");
        require(_data.length == 100, "Wrong data length");

        bytes4 sig;
        bytes32 value1;
        bytes32 value2;
        bytes32 value3;

        (sig, value1, value2, value3) = abiDecodeFundCall(_data);

        if (sig == bytes4(0x111d7d50)){
            _fund(_from, uint256(value1), uint256(value2), uint256(value3));
        } else {
            revert("Wrong method selector");
        }

    }

    /**
     * @dev Decodes abi encoded data with selector for "fund".
     * @param _data Abi encoded data.
     * @return Decoded registry call.
     */
    function abiDecodeFundCall(bytes memory _data) internal pure returns (
            bytes4 sig,
            bytes32 value1,
            bytes32 value2,
            bytes32 value3
        )
    {
        assembly {
            sig := mload(add(_data, add(0x20, 0)))
            value1 := mload(add(_data, 36))
            value2 := mload(add(_data, 68))
            value3 := mload(add(_data, 100))
        }
    }

    function abiDecodeFunctionSignature(bytes memory _data) internal pure returns (
            bytes4 sig
        )
    {
        assembly {
            sig := mload(add(_data, add(0x20, 0)))
        }
    }

    function slice(
        bytes memory _bytes,
        uint _start,
        uint _length
    )
        internal
        pure
        returns (bytes memory)
    {
        require(_bytes.length >= (_start + _length), "Length does not match _start + _length");

        bytes memory tempBytes;
        assembly {
            switch iszero(_length)
            case 0 {
                // Get a location of some free memory and store it in tempBytes as
                // Solidity does for memory variables.
                tempBytes := mload(0x40)

                // The first word of the slice result is potentially a partial
                // word read from the original array. To read it, we calculate
                // the length of that partial word and start copying that many
                // bytes into the array. The first word we copy will start with
                // data we don't care about, but the last `lengthmod` bytes will
                // land at the beginning of the contents of the new array. When
                // we're done copying, we overwrite the full first word with
                // the actual length of the slice.
                let lengthmod := and(_length, 31)

                // The multiplication in the next line is necessary
                // because when slicing multiples of 32 bytes (lengthmod == 0)
                // the following copy loop was copying the origin's length
                // and then ending prematurely not copying everything it should.
                let mc := add(add(tempBytes, lengthmod), mul(0x20, iszero(lengthmod)))
                let end := add(mc, _length)

                for {
                    // The multiplication in the next line has the same exact purpose
                    // as the one above.
                    let cc := add(add(add(_bytes, lengthmod), mul(0x20, iszero(lengthmod))), _start)
                } lt(mc, end) {
                    mc := add(mc, 0x20)
                    cc := add(cc, 0x20)
                } {
                    mstore(mc, mload(cc))
                }

                mstore(tempBytes, _length)

                //update free-memory pointer
                //allocating the array padded to 32 bytes like the compiler does now
                mstore(0x40, and(add(mc, 31), not(31)))
            }
            //if we want a zero-length slice let's just return a zero-length array
            default {
                tempBytes := mload(0x40)

                mstore(0x40, add(tempBytes, 0x20))
            }
        }

        return tempBytes;
    }
}
