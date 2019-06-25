/* solium-disable security/no-block-members */
/* solium-disable security/no-inline-assembly */

pragma solidity ^0.5.8;

import "../common/Ownable.sol";
import "../common/MessageSigned.sol";
import "../token/ERC20Token.sol";
import "./License.sol";
import "./MetadataStore.sol";
import "./Fees.sol";
import "./Arbitrable.sol";
import "./Arbitrations.sol";
import "../proxy/ProxyData.sol";
import "./EscrowManagement.sol";

/**
 * @title Escrow
 * @dev Escrow contract for buying/selling ETH. Current implementation lacks arbitrage, marking trx as paid, and ERC20 support
 */
contract Escrow is ProxyData, MessageSigned, Fees, Arbitrable {

    constructor(
        address _relayer,
        address _license,
        address _arbitrations,
        address _metadataStore,
        address payable _feeDestination,
        uint _feeMilliPercent
    )
    Fees(_feeDestination, _feeMilliPercent)
    public {
        factory = msg.sender;
        relayer = _relayer;

        license = License(_license);
        metadataStore = MetadataStore(_metadataStore);
        arbitrations = Arbitrations(_arbitrations);
    }

    address public factory;
    address public relayer;

    Arbitrations public arbitrations;

    function init(
        address _relayer,
        address _license,
        address _arbitrations,
        address _metadataStore,
        address payable _feeDestination,
        uint _feeMilliPercent
    ) public {
        require(factory == address(0), "Contract already initialized");

        factory = msg.sender;
        relayer = _relayer;

        license = License(_license);
        metadataStore = MetadataStore(_metadataStore);
        feeDestination = _feeDestination;
        feeMilliPercent = _feeMilliPercent;
        arbitrations = Arbitrations(_arbitrations);
    }

    uint256 public offerId;
    address public token;
    uint256 public tokenAmount;
    uint256 public expirationTime;
    uint256 public tradeAmount;
    uint256 public assetPrice;
    TradeType public tradeType;
    EscrowStatus public status;

    address payable public seller;
    address payable public buyer;

    address public arbitrator;

    enum TradeType {FIAT, CRYPTO}
    enum EscrowStatus {CREATED, FUNDED, PAID, RELEASED, CANCELED}

    License public license;
    MetadataStore public metadataStore;

    event Created(uint indexed offerId, address indexed seller, address indexed buyer);
    event Funded(uint expirationTime, uint amount);
    event Paid();
    event Released();
    event Canceled();

    /**
     * @notice Get Escrow Data
     */
    function data() public returns (
        uint256 e_offerId,
        address e_token,
        uint256 e_tokenAmount,
        uint256 e_expirationTime,
        uint256 e_tradeAmount,
        uint256 e_assetPrice,
        TradeType e_tradeType,
        EscrowStatus e_status,
        address payable e_seller,
        address payable e_buyer,
        address e_arbitrator
    ) {
        e_offerId = offerId;
        e_token = token;
        e_tokenAmount = tokenAmount;
        e_expirationTime = expirationTime;
        e_tradeAmount = tradeAmount;
        e_assetPrice = assetPrice;
        e_tradeType = tradeType;
        e_status = status;
        e_seller = seller;
        e_buyer = buyer;
        e_arbitrator = arbitrator;
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
        uint _offerId,
        uint _tradeAmount,
        uint8 _tradeType,
        uint _assetPrice,
        bytes memory _statusContactCode,
        string memory _location,
        string memory _username,
        uint _nonce,
        bytes memory _signature
    ) public returns (address, address) {
       buyer = metadataStore.addOrUpdateUser(_signature, _statusContactCode, _location, _username, _nonce);
       _createTransaction(buyer, _offerId, _tradeAmount, _tradeType, _assetPrice);

       return (buyer,seller);
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
    function fund(uint _tokenAmount, uint _expirationTime) external payable {
        _fund(msg.sender, _tokenAmount, _expirationTime);
    }

    function _fund(address _from, uint _tokenAmount, uint _expirationTime) internal {
        // TODO: expiration time
        require(_expirationTime > (block.timestamp + 600), "Expiration time must be at least 10min in the future");
        require(license.isLicenseOwner(_from), "Must be a valid seller to fund escrow transactions");
        require(_from == seller, "Only the seller can fund this escrow");
        require(status == EscrowStatus.CREATED, "Invalid escrow status");

        tokenAmount = _tokenAmount;
        expirationTime = _expirationTime;
        status = EscrowStatus.FUNDED;

        if(token != address(0)){
            require(msg.value == 0, "Cannot send ETH with token address different from 0");
            require(ERC20Token(token).transferFrom(_from, address(this), _tokenAmount), "Unsuccessful token transfer");
        }

        payFee(_from, _tokenAmount, token);

        emit Funded(_expirationTime, _tokenAmount);
    }

    function _createTransaction(
        address payable _buyer,
        uint _offerId,
        uint _tradeAmount,
        uint8 _tradeType,
        uint _assetPrice
    ) internal {
        bool deleted;

        (token, , , , seller, arbitrator, deleted) = metadataStore.offer(_offerId);

        require(!deleted, "Offer is not valid");
        require(license.isLicenseOwner(seller), "Must be a valid seller to create escrow transactions");
        require(seller != _buyer, "Seller and Buyer must be different");
        require(arbitrator != _buyer, "Cannot buy offers where buyer is arbitrator");
        require(_tradeAmount != 0 && _assetPrice != 0, "Prices cannot be 0");

        offerId = _offerId;
        buyer = _buyer;
        tradeAmount = _tradeAmount;
        tradeType = TradeType(_tradeType);
        assetPrice = _assetPrice;

        emit Created(_offerId, seller, _buyer);
    }

    /**
     * @notice Release escrow funds to buyer
     * @dev Requires contract to be unpaused.
     *      Can only be executed by the seller
     *      Transaction must not be expired, or previously canceled or released
     */
    function release() external {
        require(seller == msg.sender, "Only the seller can release the escrow");
        require(status == EscrowStatus.PAID || status == EscrowStatus.FUNDED, "Invalid transaction status");
        _release();
    }

    /**
     * @dev Release funds to buyer
     */
    function _release() internal {
        status = EscrowStatus.RELEASED;

        if(token == address(0)){
            buyer.transfer(tokenAmount); // TODO: transfer fee to Status?
        } else {
            require(ERC20Token(token).transfer(buyer, tokenAmount), "Couldn't transfer funds");
        }

        emit Released();
    }

    /**
     * @dev Seller/Buyer marks transaction as paid
     * @param _sender Address marking the transaction as paid
     */
    function _pay(address _sender) internal {
        require(status == EscrowStatus.FUNDED, "Transaction is not funded");
        require(expirationTime > block.timestamp, "Transaction already expired");
        require(buyer == _sender || seller == _sender, "Function can only be invoked by the escrow buyer or seller");

        status = EscrowStatus.PAID;

        emit Paid();
    }

    /**
     * @notice Mark transaction as paid
     * @dev Can only be executed by the buyer
     */
    function pay() external {
        _pay(msg.sender);
    }

    function pay_relayed(address _sender) external {
        assert(msg.sender == relayer);
        _pay(_sender);
    }

    /**
     * @notice Obtain message hash to be signed for marking a transaction as paid
     * @return message hash
     * @dev Once message is signed, pass it as _signature of pay(uint256,bytes)
     */
    function paySignHash() public view returns(bytes32){
        return keccak256(abi.encodePacked(address(this), "pay()"));
    }

    /**
     * @notice Mark transaction as paid (via signed message)
     * @param _signature Signature of the paySignHash result.
     * @dev There's a high probability of buyers not having ether to pay for the transaction.
     *      This allows anyone to relay the transaction.
     *      TODO: consider deducting funds later on release to pay the relayer (?)
     */
    function pay(bytes calldata _signature) external {
        address sender = recoverAddress(getSignHash(paySignHash()), _signature);
        _pay(sender);
    }


    /**
     * @dev Cancel an escrow operation
     * @notice Requires contract to be unpaused.
     *         Can only be executed by the seller
     *         Transaction must be expired, or previously canceled or released
     */
    function cancel() external {
        require(status == EscrowStatus.FUNDED || status == EscrowStatus.CREATED,
                "Only transactions in created or funded state can be canceled");
        require(buyer == msg.sender || seller == msg.sender, "Function can only be invoked by the escrow buyer or seller");

        if(status == EscrowStatus.FUNDED){
            if(msg.sender == seller){
                require(expirationTime < block.timestamp, "Can only be canceled after expiration");
            }
        }

        _cancel();
    }

    function cancel_relayed(address _sender) external {
        assert(msg.sender == relayer);
        require(status == EscrowStatus.FUNDED || status == EscrowStatus.CREATED,
                "Only transactions in created or funded state can be canceled");
        require(buyer == _sender, "Function can only be invoked by the escrow buyer");

        _cancel();
    }

    /**
     * @dev Cancel transaction and send funds back to seller
     */
    function _cancel() internal {
        if(status == EscrowStatus.FUNDED){
            uint amount = tokenAmount + getFeeFromAmount(tokenAmount);
            if(token == address(0)){
                seller.transfer(amount);
            } else {
                require(ERC20Token(token).transfer(seller, amount), "Transfer failed");
            }
        }

        status = EscrowStatus.CANCELED;

        emit Canceled();
    }

    /**
     * @dev Rates a transaction
     * @param _rate rating of the transaction from 1 to 5
     * @notice Requires contract to not be paused.
     *         Can only be executed by the buyer
     *         Transaction must released
     */
    function rateTransaction(uint _rate) external {
        require(_rate >= 1, "Rating needs to be at least 1");
        require(_rate <= 5, "Rating needs to be at less than or equal to 5");
        require(!arbitrations.isDisputed(address(this)), "Can't rate a transaction that has an arbitration process");

        EscrowManagement mgmt = EscrowManagement(factory);

        require(mgmt.rating(address(this)) == 0, "Transaction already rated");
        require(status == EscrowStatus.RELEASED, "Transaction not released yet");
        require(buyer == msg.sender, "Function can only be invoked by the escrow buyer");

        mgmt.rate(seller, buyer, _rate);
    }

    /**
     * @notice Open case as a buyer or seller for arbitration
     */
    function openCase(string calldata _motive) external {
        require(buyer == msg.sender || seller == msg.sender, "Only a buyer or seller can open a case");
        require(status == EscrowStatus.PAID, "Cases can only be open for paid transactions");

        arbitrations.openCase(msg.sender, _motive);
    }

    function openCase_relayed(address _sender, string calldata _motive) external {
        assert(msg.sender == relayer);

        require(buyer == _sender, "Function can only be invoked by the escrow buyer");
        require(status == EscrowStatus.PAID, "Cases can only be open for paid transactions");

        arbitrations.openCase(_sender, _motive);
    }

    /**
     * @notice Obtain message hash to be signed for opening a case
     * @return message hash
     * @dev Once message is signed, pass it as _signature of openCase(uint256,bytes)
     */
    function openCaseSignHash(string memory motive) public view returns(bytes32){
        return keccak256(abi.encodePacked(address(this), "openCase()", motive));
    }

    /**
     * @notice Open case as a buyer or seller for arbitration via a relay account
     * @param _signature Signed message result of openCaseSignHash(uint256)
     * @dev Consider opening a dispute in aragon court.
     */
    function openCase(string calldata _motive, bytes calldata _signature) external {
        require(status == EscrowStatus.PAID, "Cases can only be open for paid transactions");

        address sender = recoverAddress(getSignHash(openCaseSignHash(_motive)), _signature);

        require(buyer == sender || seller == sender, "Only a buyer or seller can open a case");

        arbitrations.openCase(sender, _motive);
    }

    /**
     * @notice Get arbitrator
     * @return Arbitrator address
     */
    function getArbitrator() public view returns(address) {
        return arbitrator;
    }

    /**
     * @notice Set arbitration result in favour of the buyer or seller and transfer funds accordingly
     * @param _releaseFunds Release funds to buyer or cancel escrow
     * @param _arbitrator Arbitrator address
     */
    function setArbitrationResult(bool _releaseFunds, address _arbitrator) external {
        assert(msg.sender == address(arbitrations));
        require(buyer != _arbitrator && seller != _arbitrator, "Arbitrator cannot be part of transaction");

        if(_releaseFunds){
            _release();
        } else {
            _cancel();
        }
    }

    /**
     * @notice Support for "approveAndCall". Callable only by the fee token.
     * @param _from Who approved.
     * @param _amount Amount being approved, need to be equal `getPrice()`.
     * @param _token Token being approved, need to be equal `token()`.
     * @param _data Abi encoded data with selector of `fund(...)`.
     */
    function receiveApproval(address _from, uint256 _amount, address _token, bytes memory _data) public {
        require(_token == address(msg.sender), "Wrong call");
        require(_data.length == 100, "Wrong data length");

        bytes4 sig;
        bytes32 value1;
        bytes32 value2;

        (sig, value1, value2) = abiDecodeFundCall(_data);

        if (sig == bytes4(0x111d7d50)){
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
    function abiDecodeFundCall(bytes memory _data) internal pure returns (
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