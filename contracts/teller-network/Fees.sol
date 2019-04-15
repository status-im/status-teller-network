pragma solidity ^0.5.7;

import "../token/ERC20Token.sol";
import "../common/Ownable.sol";

contract Fees is Ownable {
    address public feeDestination;
    uint public feeAmount;
    ERC20Token public feeToken;

    uint public feeBalance;

    event FeeDestinationChanged(address);
    event FeeAmountChanged(uint amount);
    event FeesWithdrawn(uint amount);

    mapping(uint => bool) public feePaid;

    constructor(address _feeToken, address _feeDestination, uint _feeAmount) public{
        feeToken = ERC20Token(_feeToken);
        feeDestination = _feeDestination;
        feeAmount = _feeAmount;
    }

    /**
     * @notice Set Fee Destination Address
     * @param _addr New address
     * @dev Can only be called by the owner of the contract
     */
    function setFeeDestinationAddress(address _addr) public onlyOwner {
        feeDestination = _addr;
        emit FeeDestinationChanged(_addr);
    }

    /**
     * @notice Set Fee Amount
     * @param _amount New Amount
     * @dev Can only be called by the owner of the contract
     */
    function setFeeAmount(uint _amount) public onlyOwner {
        feeAmount = _amount;
        emit FeeAmountChanged(_amount);
    }

    /**
     * @notice Withdraw Fees
     */
    function withdrawFees() public {
        uint fees = feeBalance;
        feeBalance = 0;
        require(feeToken.transfer(feeDestination, fees), "Error transfering fees");
        emit FeesWithdrawn(fees);
    }


    /**
     * @notice Pay fees for a transaction or element id
     */
    function payFee(address _from, uint _id) internal {
        if(feePaid[_id]) return;

        feePaid[_id] = true;
        feeBalance += feeAmount;
        
        require(feeToken.allowance(_from, address(this)) >= feeAmount, "Allowance not set for this contract for specified fee");
        require(feeToken.transferFrom(_from, address(this), feeAmount), "Unsuccessful token transfer");
    }	    

}
