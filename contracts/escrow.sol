pragma solidity ^0.5.0;

import "./ownable.sol";
import "./pausable.sol";
import "./license.sol";

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
        uint expirationTime;
        bool released;
        bool canceled;
    }

    EscrowTransaction[] public transactions;

    License public license;

    event Created(address indexed seller, address indexed buyer, uint amount, uint escrowId);
    event Paid(uint escrowId);
    event Canceled(uint escrowId);

    function create(address payable _buyer, uint _expirationTime) public payable whenNotPaused {
        require(_expirationTime > (block.timestamp + 600), "Expiration time must be at least 10min in the future");
        require(msg.value > 0, "ETH amount is required"); // TODO: abstract this to use ERC20. Maybe thru the use of wETH
        require(license.isLicenseOwners(msg.sender), "Must be a valid seller to create escrow transactions");

        uint escrowId = transactions.length++;

        transactions[escrowId].seller = msg.sender;
        transactions[escrowId].buyer = _buyer;
        transactions[escrowId].amount = msg.value;
        transactions[escrowId].expirationTime = _expirationTime;
        transactions[escrowId].released = false;
        transactions[escrowId].canceled = false;

        emit Created(msg.sender, _buyer, msg.value, escrowId);
    }

    function release(uint _escrowId) public whenNotPaused {
        require(_escrowId < transactions.length, "Invalid escrow id");

        EscrowTransaction storage trx = transactions[_escrowId];

        require(trx.released == false, "Transaction already released");
        require(trx.canceled == false, "Transaction already canceled");
        require(trx.expirationTime > block.timestamp, "Transaction already expired");
        require(trx.seller == msg.sender, "Function can only be invoked by the escrow owner");
        
        trx.released = true;
        trx.buyer.transfer(trx.amount); // TODO: transfer fee to Status

        emit Paid(_escrowId);
    }

    function cancel(uint _escrowId) public whenNotPaused {
        require(_escrowId < transactions.length, "Invalid escrow id");

        EscrowTransaction storage trx = transactions[_escrowId];

        require(trx.released == false, "Transaction already released");
        require(trx.canceled == false, "Transaction already canceled");
        require(trx.seller == msg.sender, "Function can only be invoked by the escrow owner");
        
        trx.canceled = true;
        trx.seller.transfer(trx.amount);

        emit Canceled(_escrowId);
    }

    function withdraw_emergency(uint _escrowId) public whenPaused {
        require(_escrowId < transactions.length, "Invalid escrow id");

        EscrowTransaction storage trx = transactions[_escrowId];

        require(trx.released == false, "Transaction already released");
        require(trx.canceled == false, "Transaction already canceled");
        
        trx.canceled = true;
        trx.seller.transfer(trx.amount);

        emit Canceled(_escrowId);
    }
}
