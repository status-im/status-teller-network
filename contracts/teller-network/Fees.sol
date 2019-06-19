pragma solidity >=0.5.0 <0.6.0;

import "../token/ERC20Token.sol";
import "../common/Ownable.sol";

/**
 * @title Fee utilities
 * @dev Fee registry, payment and withdraw utilities.
 */
contract Fees is Ownable {
    address public feeDestination;
    uint public feeAmount;
    ERC20Token public feeToken;
    uint public feeBalance;
    mapping(uint => bool) public feePaid;

    event FeeDestinationChanged(address);
    event FeeAmountChanged(uint amount);
    event FeesWithdrawn(uint amount);

    /**
     * @param _feeToken Address of token used to pay for fees (SNT)
     * @param _feeDestination Address to send the fees once withdraw is called
     * @param _feeAmount Fee amount in token-wei
     * @dev TODO: determine if the contract will hold the fees or if it will send them automatically to the fee destination address
     */
    constructor(address _feeToken, address _feeDestination, uint _feeAmount) public {
        feeToken = ERC20Token(_feeToken);
        feeDestination = _feeDestination;
        feeAmount = _feeAmount;
    }

    /**
     * @notice Set Fee Destination Address
     * @param _addr New address
     * @dev Can only be called by the owner of the contract
     *      TODO: if the contract will be changed to remove ownership, remove this function
     */
    function setFeeDestinationAddress(address _addr) public onlyOwner {
        feeDestination = _addr;
        emit FeeDestinationChanged(_addr);
    }

    /**
     * @notice Set Fee Amount
     * @param _amount New Amount
     * @dev Can only be called by the owner of the contract
     *      TODO: if the contract will be changed to remove ownership, remove this function
     */
    function setFeeAmount(uint _amount) public onlyOwner {
        feeAmount = _amount;
        emit FeeAmountChanged(_amount);
    }

    /**
     * @notice Withdraw fees by sending them to the fee destination address
     */
    function withdrawFees() public {
        uint fees = feeBalance;
        feeBalance = 0;
        require(feeToken.transfer(feeDestination, fees), "Error transfering fees");
        emit FeesWithdrawn(fees);
    }

    /**
     * @notice Pay fees for a transaction or element id
     * @param _from Address from where the fees are being extracted
     * @param _id Escrow id or element identifier to mark as paid
     * @dev This will only transfer funds if the fee  has not been paid
     */
    function payFee(address _from, uint _id) internal {
        if(feePaid[_id]) return;

        feePaid[_id] = true;
        feeBalance += feeAmount;

        require(feeToken.transferFrom(_from, address(this), feeAmount), "Unsuccessful token transfer");
    }

}
