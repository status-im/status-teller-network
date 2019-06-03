pragma solidity ^0.5.7;

import "../common/Ownable.sol";
import "../common/Pausable.sol";
import "../common/MessageSigned.sol";
import "../token/ERC20Token.sol";
import "./License.sol";
import "./MetadataStore.sol";
import "./Fees.sol";
import "./Arbitration.sol";
import "./Arbitrable.sol";

/**
 * @title Escrow
 * @dev Escrow contract for buying/selling ETH. Current implementation lacks arbitrage, marking trx as paid, and ERC20 support
 */
contract Escrow is Pausable, MessageSigned, Fees, Arbitrable {
    string private constant TRANSACTION_ALREADY_RELEASED = "Transaction already released";
    string private constant TRANSACTION_ALREADY_CANCELED = "Transaction already canceled";
    string private constant TRANSACTION_ALREADY_PAID = "Transaction already paid";
    string private constant TRANSACTION_NOT_FUNDED = "Transaction is not funded";

    string private constant INVALID_ESCROW_ID = "Invalid escrow id";
    string private constant CAN_ONLY_BE_INVOKED_BY_ESCROW_OWNER = "Function can only be invoked by the escrow owner";

    constructor(
        address _license,
        address _arbitration,
        address _metadataStore,
        address _feeToken,
        address _feeDestination,
        uint _feeAmount)
        Fees(_feeToken, _feeDestination, _feeAmount) public {
        license = License(_license);
        arbitration = Arbitration(_arbitration);
        metadataStore = MetadataStore(_metadataStore);
    }

    Arbitration arbitration;

    struct EscrowTransaction {
        uint offerId;
        address payable buyer;
        uint tokenAmount;
        uint expirationTime;
        uint rating;
        uint256 tradeAmount;
        TradeType tradeType;
        uint assetPrice;
        EscrowStatus status;
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
        string memory _username
    ) public whenNotPaused returns(uint escrowId) {
        address payable _buyer = metadataStore.addOrUpdateUser(_signature, _statusContactCode, _location, _username);
        escrowId = createTransaction(_buyer, _offerId, _tradeAmount, _tradeType, _assetPrice);
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
    function fund(uint _escrowId, uint _tokenAmount, uint _expirationTime) public payable whenNotPaused {
        _fund(msg.sender, _escrowId, _tokenAmount, _expirationTime);
    }

    function _fund(address _from, uint _escrowId, uint _tokenAmount, uint _expirationTime) internal whenNotPaused {
        require(_escrowId < transactions.length, INVALID_ESCROW_ID);
        require(_expirationTime > (block.timestamp + 600), "Expiration time must be at least 10min in the future");
        require(license.isLicenseOwner(_from), "Must be a valid seller to fund escrow transactions");

        EscrowTransaction storage trx = transactions[_escrowId];

        require(_from == metadataStore.getOfferOwner(trx.offerId), "Only the seller can fund this escrow");
        require(trx.status == EscrowStatus.CREATED, "Invalid escrow status");

        transactions[_escrowId].tokenAmount += _tokenAmount;
        transactions[_escrowId].expirationTime = _expirationTime;
        transactions[_escrowId].status = EscrowStatus.FUNDED;

        payFee(_from, _escrowId);

        address token = metadataStore.getAsset(trx.offerId);

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
    ) public payable whenNotPaused {
        uint escrowId = createTransaction(_buyer, _offerId, _tradeAmount, _tradeType, _assetPrice);
        fund(escrowId, _tokenAmount, _expirationTime);
    }

    function createTransaction(
        address payable _buyer,
        uint _offerId,
        uint _tradeAmount,
        uint8 _tradeType,
        uint _assetPrice
    ) private returns(uint escrowId) {
        address seller = metadataStore.getOfferOwner(_offerId);
        require(msg.sender == _buyer || msg.sender == seller, "Must participate in the trade");
        require(license.isLicenseOwner(seller), "Must be a valid seller to create escrow transactions");
        require(seller != _buyer, "Seller and Buyer must be different");
        require(metadataStore.getArbitrator(_offerId) != _buyer, "Cannot buy offers where buyer is arbitrator");

        escrowId = transactions.length++;

        transactions[escrowId] = EscrowTransaction({
            offerId: _offerId,
            buyer: _buyer,
            tokenAmount: 0,
            expirationTime: 0,
            rating: 0,
            tradeAmount: _tradeAmount,
            tradeType: TradeType(_tradeType),
            assetPrice: _assetPrice,
            status: EscrowStatus.CREATED,
            arbitrator: metadataStore.getArbitrator(_offerId)
        });
        transactionsByOfferId[_offerId].push(escrowId);
        emit Created(_offerId, seller, _buyer, escrowId, block.timestamp);
        return escrowId;
    }

    /**
     * @notice Release escrow funds to buyer
     * @param _escrowId Id of the escrow
     * @dev Requires contract to be unpaused.
     *      Can only be executed by the seller
     *      Transaction must not be expired, or previously canceled or released
     */
    function release(uint _escrowId) public {
        require(_escrowId < transactions.length, INVALID_ESCROW_ID);

        EscrowTransaction storage trx = transactions[_escrowId];

        require(metadataStore.getOfferOwner(trx.offerId) == msg.sender, CAN_ONLY_BE_INVOKED_BY_ESCROW_OWNER);
        require(trx.status != EscrowStatus.RELEASED, TRANSACTION_ALREADY_RELEASED);
        require(trx.status != EscrowStatus.CANCELED, TRANSACTION_ALREADY_CANCELED);
        require(trx.status == EscrowStatus.PAID || trx.status == EscrowStatus.FUNDED, TRANSACTION_NOT_FUNDED);

        _release(_escrowId, trx);
    }

    /**
     * @dev Release funds to buyer
     * @param _escrowId Id of the escrow
     * @param trx EscrowTransaction with data of transaction to be released
     */
    function _release(uint _escrowId, EscrowTransaction storage trx) private {
        trx.status = EscrowStatus.RELEASED;

        address token = metadataStore.getAsset(trx.offerId);
        if(token == address(0)){
            trx.buyer.transfer(trx.tokenAmount); // TODO: transfer fee to Status?
        } else {
            ERC20Token erc20token = ERC20Token(token);
            require(erc20token.transfer(trx.buyer, trx.tokenAmount));
        }

        emit Released(_escrowId, block.timestamp);
    }

    /**
     * @dev Seller/Buyer marks transaction as paid
     * @param _escrowId Id of the escrow
     * @param _sender Address marking the transaction as paid
     */
    function _pay(address _sender, uint _escrowId) private {
        require(_escrowId < transactions.length, "Invalid escrow id");

        EscrowTransaction storage trx = transactions[_escrowId];

        require(trx.status != EscrowStatus.RELEASED, TRANSACTION_ALREADY_RELEASED);
        require(trx.status != EscrowStatus.CANCELED, TRANSACTION_ALREADY_CANCELED);
        require(trx.status != EscrowStatus.PAID, TRANSACTION_ALREADY_PAID);
        require(trx.status == EscrowStatus.FUNDED, TRANSACTION_NOT_FUNDED);

        require(trx.expirationTime > block.timestamp, "Transaction already expired");
        require(trx.buyer == _sender || metadataStore.getOfferOwner(trx.offerId) == _sender, "Function can only be invoked by the escrow buyer or seller");

        trx.status  = EscrowStatus.PAID;

        emit Paid(_escrowId, block.timestamp);
    }

    /**
     * @notice Mark transaction as paid
     * @param _escrowId Id of the escrow
     * @dev Can only be executed by the buyer
     */
    function pay(uint _escrowId) public {
        _pay(msg.sender, _escrowId);
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
    function cancel(uint _escrowId) public whenNotPaused {
        require(_escrowId < transactions.length, INVALID_ESCROW_ID);

        EscrowTransaction storage trx = transactions[_escrowId];
        require(trx.status == EscrowStatus.FUNDED || trx.status == EscrowStatus.CREATED, "Only transactions in created or funded state can be canceled");

        address seller = metadataStore.getOfferOwner(trx.offerId);
        require(trx.buyer == msg.sender || seller == msg.sender, "Function can only be invoked by the escrow buyer or seller");

        if(trx.status == EscrowStatus.FUNDED){
            if(msg.sender == seller){
                require(trx.expirationTime < block.timestamp, "Can only be canceled after expiration");
            }
        }

        _cancel(_escrowId, trx);
    }

    /**
     * @dev Cancel transaction and send funds back to seller
     * @param _escrowId Id of the escrow
     * @param trx EscrowTransaction with details of transaction to be marked as canceled
     */
    function _cancel(uint _escrowId, EscrowTransaction storage trx) private {
        address payable seller = metadataStore.getOfferOwner(trx.offerId);

        if(trx.status == EscrowStatus.FUNDED){
            address token = metadataStore.getAsset(trx.offerId);
            if(token == address(0)){
                seller.transfer(trx.tokenAmount);
            } else {
                ERC20Token erc20token = ERC20Token(token);
                require(erc20token.transfer(seller, trx.tokenAmount), "Transfer failed");
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
    function withdraw_emergency(uint _escrowId) public whenPaused {
        require(_escrowId < transactions.length, INVALID_ESCROW_ID);
        EscrowTransaction storage trx = transactions[_escrowId];
        require(trx.status == EscrowStatus.FUNDED, "Cannot withdraw from escrow in a stage different from FUNDED. Open a case");
        _cancel(_escrowId, trx);
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
    function rateTransaction(uint _escrowId, uint _rate) public whenNotPaused {
        require(_escrowId < transactions.length, INVALID_ESCROW_ID);
        require(_rate >= 1, "Rating needs to be at least 1");
        require(_rate <= 5, "Rating needs to be at less than or equal to 5");
        require(!arbitration.exists(_escrowId), "Can't rate a transaction that has an arbitration process");

        EscrowTransaction storage trx = transactions[_escrowId];

        require(trx.rating == 0, "Transaction already rated");
        require(trx.status == EscrowStatus.RELEASED, "Transaction not released yet");
        require(trx.buyer == msg.sender, "Function can only be invoked by the escrow buyer");

        trx.rating  = _rate;
        emit Rating(trx.offerId, trx.buyer, _escrowId, _rate, block.timestamp);
    }


    /**
     * @notice Open case as a buyer or seller for arbitration
     * @param _escrowId Id of the escrow
     * @dev Consider using Aragon Court for this.
     */
    function openCase(uint _escrowId, string memory motive) public {
        EscrowTransaction storage trx = transactions[_escrowId];

        require(!arbitration.exists(_escrowId), "Case already exist");
        require(trx.buyer == msg.sender || metadataStore.getOfferOwner(trx.offerId) == msg.sender, "Only a buyer or seller can open a case");
        require(trx.status == EscrowStatus.PAID, "Cases can only be open for paid transactions");

        arbitration.openCase(_escrowId, msg.sender, motive);
    }

    /**
     * @notice Open case as a buyer or seller for arbitration via a relay account
     * @param _escrowId Id of the escrow
     * @param _signature Signed message result of openCaseSignHash(uint256)
     * @dev Consider opening a dispute in aragon court.
     */
    function openCaseWithSignature(uint _escrowId, bytes calldata _signature) external {
        EscrowTransaction storage trx = transactions[_escrowId];

        require(!arbitration.exists(_escrowId), "Case already exist");
        require(trx.status == EscrowStatus.PAID, "Cases can only be open for paid transactions");

        address senderAddress = recoverAddress(getSignHash(openCaseSignHash(_escrowId)), _signature);

        require(trx.buyer == senderAddress || metadataStore.getOfferOwner(trx.offerId) == senderAddress, "Only a buyer or seller can open a case");

        // FIXME get actual motive from the signature if possible
        arbitration.openCase(_escrowId, msg.sender, '');
    }

    /**
     * @notice Set arbitration result in favour of the buyer or seller and transfer funds accordingly
     * @param _escrowId Id of the escrow
     * @param _releaseFunds Release funds to buyer or cancel escrow
     * @param _arbitrator Arbitrator address
     */
    function setArbitrationResult(uint _escrowId, bool _releaseFunds, address _arbitrator) external {
        assert(msg.sender == address(arbitration)); // Only arbitration contract can invoke this

        EscrowTransaction storage trx = transactions[_escrowId];

        require(trx.buyer != _arbitrator && metadataStore.getOfferOwner(trx.offerId) != _arbitrator, "Arbitrator cannot be part of transaction");

        if(_releaseFunds){
            _release(_escrowId, trx);
        } else {
            _cancel(_escrowId, trx);
        }
    }

    /**
     * @notice Get arbitrator
     * @param _escrowId Id of the escrow
     * @return Arbitrator address
     */
    function getArbitrator(uint _escrowId) external view returns(address) {
        EscrowTransaction storage trx = transactions[_escrowId];
        return trx.arbitrator;
    }


    /**
     * @notice Obtain message hash to be signed for opening a case
     * @param _escrowId Id of the escrow
     * @return message hash
     * @dev Once message is signed, pass it as _signature of openCase(uint256,bytes)
     */
    function openCaseSignHash(uint _escrowId) public view returns(bytes32){
        return keccak256(
            abi.encodePacked(
                address(this),
                "openCase(uint256)",
                _escrowId
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
        require(_token == address(msg.sender), "Wrong call");
        require(_data.length == 100, "Wrong data length");

        bytes4 sig;
        bytes32 value1;
        bytes32 value2;
        bytes32 value3;

        (sig, value1, value2, value3) = abiDecodeRegister(_data);

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
    function abiDecodeRegister(bytes memory _data) private pure returns (
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
}
