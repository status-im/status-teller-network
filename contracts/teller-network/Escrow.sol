/* solium-disable security/no-block-members */
/* solium-disable security/no-inline-assembly */

pragma solidity >=0.5.0 <0.6.0;

import "../common/Pausable.sol";
import "../common/MessageSigned.sol";
import "../token/ERC20Token.sol";

import "./License.sol";
import "./MetadataStore.sol";
import "./Fees.sol";
import "./Arbitrable.sol";
import "./IEscrow.sol";

/**
 * @title Escrow
 * @dev Escrow contract for buying/selling ETH. Current implementation lacks arbitrage, marking trx as paid, and ERC20 support
 */
contract Escrow is IEscrow, Pausable, MessageSigned, Fees, Arbitrable {

    EscrowTransaction[] public transactions;

    address public relayer;
    License public sellerLicenses;
    MetadataStore public metadataStore;

    event Created(uint indexed offerId, address indexed seller, address indexed buyer, uint escrowId);
    event Funded(uint indexed escrowId, uint expirationTime, uint amount);
    event Paid(uint indexed escrowId);
    event Released(uint indexed escrowId);
    event Canceled(uint indexed escrowId);
    event Rating(uint indexed offerId, address indexed buyer, uint indexed escrowId, uint rating);

    bool internal _initialized;

    constructor(
        address _relayer,
        address _sellerLicenses,
        address _arbitratorLicenses,
        address _metadataStore,
        address payable _feeDestination,
        uint _feeMilliPercent)
        Fees(_feeDestination, _feeMilliPercent)
        Arbitrable(_arbitratorLicenses)
        public {
        _initialized = true;
        sellerLicenses = License(_sellerLicenses);
        metadataStore = MetadataStore(_metadataStore);
    }

    function init(
        address _relayer,
        address _sellerLicenses,
        address _arbitratorLicenses,
        address _metadataStore,
        address payable _feeDestination,
        uint _feeMilliPercent
    ) public {
        assert(_initialized == false);

        _initialized = true;

        sellerLicenses = License(_sellerLicenses);
        arbitratorLicenses = License(_arbitratorLicenses);
        metadataStore = MetadataStore(_metadataStore);
        relayer = _relayer;
        feeDestination = _feeDestination;
        feeMilliPercent = _feeMilliPercent;
        paused = false;
        _setOwner(msg.sender);
    }

    function setRelayer(address _relayer) public onlyOwner {
        relayer = _relayer;
    }

    function setLicenses(address _sellerLicenses, address _arbitratorLicenses) public onlyOwner {
        sellerLicenses = License(_sellerLicenses);
        arbitratorLicenses = License(_arbitratorLicenses);
    }

    function setMetadataStore(address _metadataStore) public onlyOwner {
        metadataStore = MetadataStore(_metadataStore);
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
    function create (
        uint _offerId,
        uint _tradeAmount,
        uint8 _tradeType,
        uint _assetPrice,
        bytes memory _statusContactCode,
        string memory _location,
        string memory _username,
        uint _nonce,
        bytes memory _signature
    ) public returns(uint escrowId) {
        address payable _buyer = metadataStore.addOrUpdateUser(_signature, _statusContactCode, _location, _username, _nonce);
        escrowId = _createTransaction(_buyer, _offerId, _tradeAmount, _tradeType, _assetPrice);
    }

    /**
     * @notice Fund a new escrow
     * @param _tokenAmount How much ether/tokens will be put in escrow
     * @dev Requires contract to be unpaused.
     *         The seller needs to be licensed.
     *         The expiration time must be at least 10min in the future
     *         For eth transfer, _amount must be equals to msg.value, for token transfer, requires an allowance and transfer valid for _amount
     */
    function fund(uint _escrowId, uint _tokenAmount) external payable whenNotPaused {
        _fund(msg.sender, _escrowId, _tokenAmount);
    }

    // TODO: check if tokenAmount should be input value

    function _fund(address _from, uint _escrowId, uint _tokenAmount) internal whenNotPaused {
        require(transactions[_escrowId].seller == _from, "Only the seller can invoke this function");
        require(transactions[_escrowId].status == EscrowStatus.CREATED, "Invalid escrow status");

        require(sellerLicenses.isLicenseOwner(_from), "Must be a valid seller to fund escrow transactions");

        transactions[_escrowId].tokenAmount = _tokenAmount;
        transactions[_escrowId].expirationTime = block.timestamp + 5 days;
        transactions[_escrowId].status = EscrowStatus.FUNDED;

        address token = transactions[_escrowId].token;
        if (token != address(0)) {
            require(msg.value == 0, "Cannot send ETH with token address different from 0");
            ERC20Token erc20token = ERC20Token(token);
            require(erc20token.transferFrom(_from, address(this), _tokenAmount), "Unsuccessful token transfer fund");
        }

        _payFee(_from, _escrowId, _tokenAmount, token);

        emit Funded(_escrowId, block.timestamp + 5 days, _tokenAmount);
    }

    function _createTransaction(
        address payable _buyer,
        uint _offerId,
        uint _tradeAmount,
        uint8 _tradeType,
        uint _assetPrice
    ) internal whenNotPaused returns(uint escrowId) {
        
        address payable seller;
        address payable arbitrator;
        bool deleted;
        address token;

        (token, , , , seller, arbitrator, deleted) = metadataStore.offer(_offerId);

        require(!deleted, "Offer is not valid");
        require(sellerLicenses.isLicenseOwner(seller), "Must be a valid seller to create escrow transactions");
        require(seller != _buyer, "Seller and Buyer must be different");
        require(arbitrator != _buyer, "Cannot buy offers where buyer is arbitrator");
        require(_tradeAmount != 0 && _assetPrice != 0, "Prices cannot be 0");

        escrowId = transactions.length++;

        transactions[escrowId].offerId = _offerId;
        transactions[escrowId].token = token;
        transactions[escrowId].buyer = _buyer;
        transactions[escrowId].seller = seller;
        transactions[escrowId].arbitrator = arbitrator;
        transactions[escrowId].tradeAmount = _tradeAmount;
        transactions[escrowId].tradeType = TradeType(_tradeType);
        transactions[escrowId].assetPrice = _assetPrice;

        emit Created(_offerId, seller, _buyer, escrowId);
    }

    function getRelayData(uint _escrowId) external view returns(address payable buyer, address payable seller, address token, uint tokenAmount) {
        buyer = transactions[_escrowId].buyer;
        seller = transactions[_escrowId].seller;
        tokenAmount = transactions[_escrowId].tokenAmount;
        token = transactions[_escrowId].token;
        
        return (buyer, seller, token, tokenAmount);
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
        require(transactions[_escrowId].seller == msg.sender, "Only the seller can invoke this function");
        require(mStatus == EscrowStatus.PAID || mStatus == EscrowStatus.FUNDED, "Invalid transaction status");
        _release(_escrowId, transactions[_escrowId], false);
    }

    /**
     * @dev Release funds to buyer
     * @param _escrowId Id of the escrow
     * @param trx EscrowTransaction with data of transaction to be released
     */
    function _release(uint _escrowId, EscrowTransaction storage trx, bool isDispute) internal {
        trx.status = EscrowStatus.RELEASED;
        address token = trx.token;
        if(token == address(0)){
            trx.buyer.transfer(trx.tokenAmount);
        } else {
            require(ERC20Token(token).transfer(trx.buyer, trx.tokenAmount), "Couldn't transfer funds");
        }
        releaseFee(trx.arbitrator, trx.tokenAmount, token, isDispute);

        emit Released(_escrowId);
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
        require(trx.buyer == _sender || trx.seller == _sender, "Only participants can invoke this function");

        trx.status = EscrowStatus.PAID;

        emit Paid(_escrowId);
    }

    /**
     * @notice Mark transaction as paid
     * @param _escrowId Id of the escrow
     * @dev Can only be executed by the buyer
     */
    function pay(uint _escrowId) external {
        _pay(msg.sender, _escrowId);
    }


    function pay_relayed(address _sender, uint _escrowId) external {
        assert(msg.sender == relayer);
        _pay(_sender, _escrowId);
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

        require(trx.buyer == msg.sender || trx.seller == msg.sender, "Only participants can invoke this function");

        if(mStatus == EscrowStatus.FUNDED){
            if(msg.sender == trx.seller){
                require(trx.expirationTime < block.timestamp, "Can only be canceled after expiration");
            }
        }

        _cancel(_escrowId, trx, false);
    }

    function cancel_relayed(address _sender, uint _escrowId) external {
        assert(msg.sender == relayer);

        EscrowTransaction storage trx = transactions[_escrowId];
        EscrowStatus mStatus = trx.status;
        require(trx.buyer == _sender, "Only the buyer can invoke this function");
        require(mStatus == EscrowStatus.FUNDED || mStatus == EscrowStatus.CREATED,
                "Only transactions in created or funded state can be canceled");

         _cancel(_escrowId, trx, false);
    }

    /**
     * @dev Cancel transaction and send funds back to seller
     * @param _escrowId Id of the escrow
     * @param trx EscrowTransaction with details of transaction to be marked as canceled
     */
    function _cancel(uint _escrowId, EscrowTransaction storage trx, bool isDispute) internal {
        if(trx.status == EscrowStatus.FUNDED){
            address token = trx.token;
            uint amount;
            if (isDispute) {
                amount = trx.tokenAmount;
            } else {
                amount = trx.tokenAmount + getValueOffMillipercent(trx.tokenAmount, feeMilliPercent);
            }
            
            if(token == address(0)){
                trx.seller.transfer(amount);
            } else {
                ERC20Token erc20token = ERC20Token(token);
                require(erc20token.transfer(trx.seller, amount), "Transfer failed");
            }
        }

        trx.status = EscrowStatus.CANCELED;
        emit Canceled(_escrowId);
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

        _cancel(_escrowId, trx, false);
    }

    /**
     * @dev Rates a transaction
     * @param _escrowId Id of the escrow
     * @param _rate rating of the transaction from 1 to 5
     * @notice Requires contract to not be paused.
     *         Can only be executed by the buyer
     *         Transaction must released
     */
    function rateTransaction(uint _escrowId, uint _rate) external {
        require(_rate >= 1, "Rating needs to be at least 1");
        require(_rate <= 5, "Rating needs to be at less than or equal to 5");
        require(!isDisputed(_escrowId), "Can't rate a transaction that has an arbitration process");

        EscrowTransaction storage trx = transactions[_escrowId];

        require(trx.rating == 0, "Transaction already rated");
        require(trx.status == EscrowStatus.RELEASED, "Transaction not released yet");
        require(trx.buyer == msg.sender, "Only the buyer can invoke this function");

        trx.rating = _rate;

        emit Rating(trx.offerId, trx.buyer, _escrowId, _rate);
    }


    /**
     * @notice Open case as a buyer or seller for arbitration
     * @param _escrowId Id of the escrow
     * @dev Consider using Aragon Court for this.
     */
    function openCase(uint _escrowId, string calldata motive) external {
        EscrowTransaction storage trx = transactions[_escrowId];

        require(!isDisputed(_escrowId), "Case already exist");
        require(trx.buyer == msg.sender || metadataStore.getOfferOwner(trx.offerId) == msg.sender, "Only participants can invoke this function");
        require(trx.status == EscrowStatus.PAID, "Cases can only be open for paid transactions");

        _openDispute(_escrowId, msg.sender, motive);
    }

    function openCase_relayed(address _sender, uint256 _escrowId, string calldata _motive) external {
        assert(msg.sender == relayer);
        
        EscrowTransaction storage trx = transactions[_escrowId];
        
        require(!isDisputed(_escrowId), "Case already exist");
        require(trx.buyer == _sender, "Only the buyer can invoke this function");
        require(trx.status == EscrowStatus.PAID, "Cases can only be open for paid transactions");
        
        _openDispute(_escrowId, _sender, _motive);
    }

    /**
     * @notice Open case as a buyer or seller for arbitration via a relay account
     * @param _escrowId Id of the escrow
     * @param _signature Signed message result of openCaseSignHash(uint256)
     * @dev Consider opening a dispute in aragon court.
     */
    function openCase(uint _escrowId, string calldata motive, bytes calldata _signature) external {
        EscrowTransaction storage trx = transactions[_escrowId];

        require(!isDisputed(_escrowId), "Case already exist");
        require(trx.status == EscrowStatus.PAID, "Cases can only be open for paid transactions");

        address senderAddress = recoverAddress(getSignHash(openCaseSignHash(_escrowId, motive)), _signature);

        require(trx.buyer == senderAddress || trx.seller == senderAddress, "Only participants can invoke this function");

        _openDispute(_escrowId, msg.sender, motive);
    }

    /**
     * @notice Set arbitration result in favour of the buyer or seller and transfer funds accordingly
     * @param _escrowId Id of the escrow
     * @param _releaseFunds Release funds to buyer or cancel escrow
     * @param _arbitrator Arbitrator address
     */
    function _solveDispute(uint _escrowId, bool _releaseFunds, address _arbitrator) internal {
        EscrowTransaction storage trx = transactions[_escrowId];

        require(trx.buyer != _arbitrator && trx.seller != _arbitrator, "Arbitrator cannot be part of transaction");

        if(_releaseFunds){
            _release(_escrowId, trx, true);
        } else {
            _cancel(_escrowId, trx, true);
            releaseFee(trx.arbitrator, trx.tokenAmount, trx.token, true);
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

    /**
     * @notice Support for "approveAndCall". Callable only by the fee token.
     * @param _from Who approved.
     * @param _amount Amount being approved, need to be equal `getPrice()`.
     * @param _token Token being approved, need to be equal `token()`.
     * @param _data Abi encoded data with selector of `register(bytes32,address,bytes32,bytes32)`.
     */
    function receiveApproval(address _from, uint256 _amount, address _token, bytes memory _data) public {
        require(_token == address(msg.sender), "Wrong call");
        require(_data.length == 68, "Wrong data length");

        bytes4 sig;
        bytes32 value1;
        bytes32 value2;

        (sig, value1, value2) = _abiDecodeFundCall(_data);

        if (sig == bytes4(0xa65e2cfd)){ // fund(uint,uint,uint)
            _fund(_from, uint256(value1), uint256(value2));
        } else {
            revert("Wrong method selector");
        }
    }

    /**
     * @dev Decodes abi encoded data with selector for "fund".
     * @param _data Abi encoded data.
     * @return Decoded registry call.
     */
    function _abiDecodeFundCall(bytes memory _data) internal pure returns (
            bytes4 sig,
            bytes32 value1,
            bytes32 value2
        )
    {
        assembly {
            sig := mload(add(_data, add(0x20, 0)))
            value1 := mload(add(_data, 36))
            value2 := mload(add(_data, 68))
        }
    }
}
