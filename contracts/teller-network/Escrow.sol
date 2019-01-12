pragma solidity ^0.5.0;

import "../common/Ownable.sol";
import "../common/Pausable.sol";
import "../common/MessageSigned.sol";
import "./License.sol";
import "../token/ERC20Token.sol";


/**
 * @title Escrow
 * @dev Escrow contract for buying/selling ETH. Current implementation lacks arbitrage, marking trx as paid, and ERC20 support
 */
contract Escrow is Pausable, MessageSigned {
    string private constant TRANSACTION_ALREADY_RELEASED = "Transaction already released";
    string private constant TRANSACTION_ALREADY_CANCELED = "Transaction already canceled";
    string private constant INVALID_ESCROW_ID = "Invalid escrow id";
    string private constant CAN_ONLY_BE_INVOKED_BY_ESCROW_OWNER = "Function can only be invoked by the escrow owner";

    constructor(address _license, address _arbitrator) public {
        license = License(_license);
        arbitrator = _arbitrator;
    }

    struct EscrowTransaction {
        address payable seller;
        address payable buyer;
        uint amount;
        address token;
        uint expirationTime;
        bool released;
        bool canceled;
        bool paid;
        uint rating;
    }

    EscrowTransaction[] public transactions;

    License public license;

    address public arbitrator;

    event Created(address indexed seller, address indexed buyer, uint escrowId, uint expirationTime, uint amount);
    event Paid(uint escrowId);
    event Released(uint escrowId);
    event Canceled(uint escrowId);
    event Rating(address indexed seller, address indexed buyer, uint escrowId, uint rating);

    mapping(uint => ArbitrationCase) public arbitrationCases;

    struct ArbitrationCase {
        bool open;
        address openBy;
        address arbitrator;
        ArbitrationResult result;
    }

    event ArbitratorChanged(address arbitrator);
    event ArbitrationRequired(uint escrowId);
    event ArbitrationResolved(uint escrowId, ArbitrationResult result, address arbitrator);

    enum ArbitrationResult {UNSOLVED, BUYER, SELLER}

    /**
     * @notice Create a new escrow
     * @param _buyer The address that will perform the buy for the escrow
     * @param _amount How much ether/tokens will be put in escrow
     * @param _token Token address. Must be 0 for ETH
     * @param _expirationTime Unix timestamp before the transaction is considered expired
     * @dev Requires contract to be unpaused.
     *         The seller needs to be licensed.
     *         The expiration time must be at least 10min in the future
     *         For eth transfer, _amount must be equals to msg.value, for token transfer, requires an allowance and transfer valid for _amount
     */
    function create(address payable _buyer, uint _amount, address _token, uint _expirationTime) public payable whenNotPaused {
        require(_expirationTime > (block.timestamp + 600), "Expiration time must be at least 10min in the future");
        require(license.isLicenseOwner(msg.sender), "Must be a valid seller to create escrow transactions");

        if(_token == address(0)){
            require(msg.value == _amount, "ETH amount is required");
        } else {
            require(msg.value == 0, "Cannot send ETH with token address different from 0");
            ERC20Token token = ERC20Token(_token);
            require(token.allowance(msg.sender, address(this)) >= _amount, "Allowance not set for this contract for specified amount");
            require(token.transferFrom(msg.sender, address(this), _amount), "Unsuccessful token transfer");
        }


        uint escrowId = transactions.length++;

        transactions[escrowId].seller = msg.sender;
        transactions[escrowId].buyer = _buyer;
        transactions[escrowId].token = _token;
        transactions[escrowId].amount = _amount;
        transactions[escrowId].expirationTime = _expirationTime;
        transactions[escrowId].released = false;
        transactions[escrowId].canceled = false;
        transactions[escrowId].paid = false;

        emit Created(msg.sender, _buyer, escrowId, _expirationTime, _amount);
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

        require(trx.seller == msg.sender, CAN_ONLY_BE_INVOKED_BY_ESCROW_OWNER);
        require(trx.released == false, TRANSACTION_ALREADY_RELEASED);
        require(trx.canceled == false, TRANSACTION_ALREADY_CANCELED);

        _release(_escrowId, trx);
    }

    /**
     * @dev Release funds to buyer
     * @param _escrowId Id of the escrow
     * @param trx EscrowTransaction with data of transaction to be released
     */
    function _release(uint _escrowId, EscrowTransaction storage trx) private {
        trx.released = true;

        if(trx.token == address(0)){
            trx.buyer.transfer(trx.amount); // TODO: transfer fee to Status?
        } else {
            ERC20Token token = ERC20Token(trx.token);
            require(token.transfer(trx.buyer, trx.amount));
        }

        emit Released(_escrowId);
    }

    /**
     * @dev Seller/Buyer marks transaction as paid
     * @param _escrowId Id of the escrow
     * @param _sender Address marking the transaction as paid
     */
    function _pay(address _sender, uint _escrowId) private {
        require(_escrowId < transactions.length, "Invalid escrow id");

        EscrowTransaction storage trx = transactions[_escrowId];

        require(trx.paid == false, "Transaction already paid");
        require(trx.released == false, "Transaction already released");
        require(trx.canceled == false, "Transaction already canceled");
        require(trx.expirationTime > block.timestamp, "Transaction already expired");
        require(trx.buyer == _sender || trx.seller == _sender, "Function can only be invoked by the escrow buyer or seller");

        trx.paid = true;

        emit Paid(_escrowId);
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

        require(trx.released == false, TRANSACTION_ALREADY_RELEASED);
        require(trx.canceled == false, TRANSACTION_ALREADY_CANCELED);
        require(trx.seller == msg.sender, CAN_ONLY_BE_INVOKED_BY_ESCROW_OWNER);
        require(trx.expirationTime < block.timestamp, "Transaction has not expired");
        require(trx.paid == false, "Cannot cancel an already paid transaction. Open a case");

        _cancel(_escrowId, trx);
    }

    /**
     * @dev Cancel transaction and send funds back to seller
     * @param _escrowId Id of the escrow
     * @param trx EscrowTransaction with details of transaction to be marked as canceled
     */
    function _cancel(uint _escrowId, EscrowTransaction storage trx) private {
        trx.canceled = true;

        if(trx.token == address(0)){
            trx.seller.transfer(trx.amount);
        } else {
            ERC20Token token = ERC20Token(trx.token);
            require(token.transfer(trx.seller, trx.amount));
        }

        emit Canceled(_escrowId);
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

        require(trx.released == false, TRANSACTION_ALREADY_RELEASED);
        require(trx.canceled == false, TRANSACTION_ALREADY_CANCELED);
        require(trx.paid == false, "Cannot withdraw an already paid transaction. Open a case");

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
        require(arbitrationCases[_escrowId].open == false && arbitrationCases[_escrowId].result == ArbitrationResult.UNSOLVED, "Can't rate a transaction that has an arbitration process");

        EscrowTransaction storage trx = transactions[_escrowId];

        require(trx.rating == 0, "Transaction already rated");
        require(trx.released == true, "Transaction not released yet");
        require(trx.buyer == msg.sender, "Function can only be invoked by the escrow buyer");

        trx.rating  = _rate;
        emit Rating(trx.seller, trx.buyer, _escrowId, _rate);
    }

    modifier onlyArbitrator {
        require(isArbitrator(msg.sender), "Only arbitrators can invoke this function");
        _;
    }

    /**
     * @notice Determine if address is arbitrator
     * @param _addr Address to be verified
     * @return result
     */
    function isArbitrator(address _addr) public view returns(bool){
        return arbitrator == _addr;
    }

    /**
     * @notice Set address as arbitrator
     * @param _addr New arbitrator address
     * @dev Can only be called by the owner of the controller
     */
    function setArbitrator(address _addr) public onlyOwner {
        arbitrator = _addr;
        emit ArbitratorChanged(_addr);
    }

    /**
     * @notice Open case as a buyer or seller for arbitration
     * @param _escrowId Id of the escrow
     * @dev Consider using Aragon Court for this.
     */
    function openCase(uint _escrowId) public {
        require(arbitrationCases[_escrowId].open == false && arbitrationCases[_escrowId].result == ArbitrationResult.UNSOLVED, "Case already exist");
        require(transactions[_escrowId].buyer == msg.sender || transactions[_escrowId].seller == msg.sender, "Only a buyer or seller can open a case");
        require(transactions[_escrowId].paid == true, "Cases can only be open for paid transactions");

        arbitrationCases[_escrowId] = ArbitrationCase({
            open: true,
            openBy: msg.sender,
            arbitrator: address(0),
            result: ArbitrationResult.UNSOLVED
        });

        emit ArbitrationRequired(_escrowId);
    }

    /**
     * @notice Open case as a buyer or seller for arbitration via a relay account
     * @param _escrowId Id of the escrow
     * @param _signature Signed message result of openCaseSignHash(uint256)
     * @dev Consider opening a dispute in aragon court.
     */
    function openCase(uint _escrowId, bytes calldata _signature) external {
        require(arbitrationCases[_escrowId].open == false && arbitrationCases[_escrowId].result == ArbitrationResult.UNSOLVED, "Case already exist");
        require(transactions[_escrowId].paid == true, "Cases can only be open for paid transactions");

        address senderAddress = recoverAddress(getSignHash(openCaseSignHash(_escrowId)), _signature);

        require(transactions[_escrowId].buyer == senderAddress || transactions[_escrowId].seller == senderAddress, "Only a buyer or seller can open a case");

        arbitrationCases[_escrowId] = ArbitrationCase({
            open: true,
            openBy: msg.sender,
            arbitrator: address(0),
            result: ArbitrationResult.UNSOLVED
        });

        emit ArbitrationRequired(_escrowId);
    }

    /**
     * @notice Set arbitration result in favour of the buyer or seller and transfer funds accordingly
     * @param _escrowId Id of the escrow
     * @param _result Result of the arbitration
     */
    function setArbitrationResult(uint _escrowId, ArbitrationResult _result) public onlyArbitrator {
        require(arbitrationCases[_escrowId].open == true && arbitrationCases[_escrowId].result == ArbitrationResult.UNSOLVED, "Case must be open and unsolved");
        require(_result != ArbitrationResult.UNSOLVED, "Arbitration does not have result");

        EscrowTransaction storage trx = transactions[_escrowId];

        require(trx.buyer != arbitrator && trx.seller != arbitrator, "Arbitrator cannot be part of transaction");

        arbitrationCases[_escrowId].open = false;
        arbitrationCases[_escrowId].result = _result;

        // TODO: incentive mechanism for opening arbitration process
        // if(arbitrationCases[_escrowId].openBy != trx.seller || arbitrationCases[_escrowId].openBy != trx.buyer){
            // Consider deducting a fee as reward for whoever opened the arbitration process.
        // }

        emit ArbitrationResolved(_escrowId, _result, msg.sender);

        if(_result == ArbitrationResult.BUYER){
            _release(_escrowId, trx);
        } else {
            _cancel(_escrowId, trx);
        }
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
}

