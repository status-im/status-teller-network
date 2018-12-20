pragma solidity ^0.5.0;

import "./ownable.sol";
import "./pausable.sol";
import "./license.sol";
import "./erc20token.sol";


/**
 * @title Escrow
 * @dev Escrow contract for buying/selling ETH. Current implementation lacks arbitrage, marking trx as paid, and ERC20 support
 */
contract Escrow is Pausable {

    constructor(address _license) public {
        license = License(_license);
    }

    struct EscrowTransaction {
        address payable seller;
        address payable buyer;
        uint amount;
        address token;
        uint expirationTime;
        bool released;
        bool canceled;
        uint rating;
    }

    EscrowTransaction[] public transactions;

    License public license;

    event Created(address indexed seller, address indexed buyer, uint escrowId);
    event Paid(uint escrowId);
    event Canceled(uint escrowId);
    event Rating(address indexed seller, address indexed buyer, uint escrowId, uint rating);

    /**
     * @dev Create a new escrow
     * @param _buyer The address that will perform the buy for the escrow
     * @param _amount How much ether/tokens will be put in escrow
     * @param _token Token address. Must be 0 for ETH
     * @param _expirationTime Unix timestamp before the transaction is considered expired
     * @notice Requires contract to be unpaused.
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

        emit Created(msg.sender, _buyer, escrowId);
    }

    /**
     * @dev Release escrow funds to buyer
     * @param _escrowId Id of the escrow
     * @notice Requires contract to be unpaused.
     *         Can only be executed by the seller
     *         Transaction must not be expired, or previously canceled or released
     */
    function release(uint _escrowId) public whenNotPaused {
        require(_escrowId < transactions.length, "Invalid escrow id");

        EscrowTransaction storage trx = transactions[_escrowId];

        require(trx.released == false, "Transaction already released");
        require(trx.canceled == false, "Transaction already canceled");
        require(trx.expirationTime > block.timestamp, "Transaction already expired");
        require(trx.seller == msg.sender, "Function can only be invoked by the escrow owner");

        trx.released = true;

        if(trx.token == address(0)){
            trx.buyer.transfer(trx.amount); // TODO: transfer fee to Status
        } else {
            ERC20Token token = ERC20Token(trx.token);
            require(token.transfer(trx.buyer, trx.amount));
        }

        emit Paid(_escrowId);
    }

    /**
     * @dev Cancel an escrow operation
     * @param _escrowId Id of the escrow
     * @notice Requires contract to be unpaused.
     *         Can only be executed by the seller
     *         Transaction must not be expired, or previously canceled or released
     */
    function cancel(uint _escrowId) public whenNotPaused {
        require(_escrowId < transactions.length, "Invalid escrow id");

        EscrowTransaction storage trx = transactions[_escrowId];

        require(trx.released == false, "Transaction already released");
        require(trx.canceled == false, "Transaction already canceled");
        require(trx.seller == msg.sender, "Function can only be invoked by the escrow owner");

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
        require(_escrowId < transactions.length, "Invalid escrow id");

        EscrowTransaction storage trx = transactions[_escrowId];

        require(trx.released == false, "Transaction already released");
        require(trx.canceled == false, "Transaction already canceled");

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
    function rate_transaction(uint _escrowId, uint _rate) public whenNotPaused {
        require(_escrowId < transactions.length, "Invalid escrow id");
        require(_rate >= 1, "Rating needs to be at least 1");
        require(_rate <= 5, "Rating needs to be at less than or equal to 5");

        EscrowTransaction storage trx = transactions[_escrowId];

        require(trx.rating == 0, "Transaction already rated");
        require(trx.released == true, "Transaction not released yet");
        require(trx.buyer == msg.sender, "Function can only be invoked by the escrow buyer");

        trx.rating  = _rate;
        emit Rating(trx.seller, trx.buyer, _escrowId, _rate);
    }
}
