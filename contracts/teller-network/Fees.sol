pragma solidity >=0.5.0 <0.6.0;

import "../token/ERC20Token.sol";
import "../common/Ownable.sol";

/**
 * @title Fee utilities
 * @dev Fee registry, payment and withdraw utilities.
 */
contract Fees is Ownable {
    address payable public feeDestination;
    uint public feeMilliPercent;
    mapping(address => uint) public feeTokenBalances;
    mapping(uint => bool) public feePaid;

    event FeeDestinationChanged(address payable);
    event FeeMilliPercentChanged(uint amount);
    event FeesWithdrawn(uint amount, address token);
    event MyEvent(uint fees, address destination, uint balance);

    /**
     * @param _feeDestination Address to send the fees once withdraw is called
     * @param _feeMilliPercent Millipercent for the fee off teh amount sold
     * @dev TODO: determine if the contract will hold the fees or if it will send them automatically to the fee destination address
     */
    constructor(address payable _feeDestination, uint _feeMilliPercent) public {
        feeDestination = _feeDestination;
        feeMilliPercent = _feeMilliPercent;
    }

    /**
     * @notice Set Fee Destination Address
     * @param _addr New address
     * @dev Can only be called by the owner of the contract
     *      TODO: if the contract will be changed to remove ownership, remove this function
     */
    function setFeeDestinationAddress(address payable _addr) public onlyOwner {
        feeDestination = _addr;
        emit FeeDestinationChanged(_addr);
    }

    /**
     * @notice Set Fee Amount
     * @param _feeMilliPercent New millipercent
     * @dev Can only be called by the owner of the contract
     *      TODO: if the contract will be changed to remove ownership, remove this function
     */
    function setFeeAmount(uint _feeMilliPercent) public onlyOwner {
        feeMilliPercent = _feeMilliPercent;
        emit FeeMilliPercentChanged(_feeMilliPercent);
    }

    /**
     * @notice Withdraw fees by sending them to the fee destination address
     */
    function withdrawFees(address _tokenAddress) public {
        uint fees = feeTokenBalances[_tokenAddress];
        feeTokenBalances[_tokenAddress] = 0;
        if (_tokenAddress == address(0)) {
            require(address(this).balance >= fees, "Not enough balance");
            feeDestination.transfer(fees);
            emit MyEvent(fees, feeDestination, address(this).balance);
        } else {
            ERC20Token tokenToWithdraw = ERC20Token(_tokenAddress);
            require(tokenToWithdraw.transfer(feeDestination, fees), "Error transferring fees");
        }
        emit FeesWithdrawn(fees, _tokenAddress);
    }

    function getFeeFromAmount(uint _value) internal returns(uint) {
        // To get the factor, we divide like 100 like a normal percent, but we multiply that by 1000 because it's a milliPercent
        // Eg: 1 % = 1000 millipercent => Factor is 0.01, so 1000 divided by 100 * 1000
        return (_value * feeMilliPercent) / (100 * 1000);
    }

    /**
     * @notice Pay fees for a transaction or element id
     * @param _from Address from where the fees are being extracted
     * @param _id Escrow id or element identifier to mark as paid
     * @param _value Value sold in the escrow
     * @param _feeAmount Fee amount calculated by the front-end
     * @param _tokenAddress Address of the token sold in the escrow
     * @dev This will only transfer funds if the fee  has not been paid
     */
    function payFee(address _from, uint _id, uint _value, uint _feeAmount, address _tokenAddress) internal {
        if (feePaid[_id]) return;

        feePaid[_id] = true;
        uint amount = getFeeFromAmount(_value);
        require(amount == _feeAmount, "Fee amount needs to match the percentage");
        feeTokenBalances[_tokenAddress] += amount;

        if (_tokenAddress != address(0)) {
            ERC20Token tokenToPay = ERC20Token(_tokenAddress);
            require(tokenToPay.allowance(_from, address(this)) >= amount, "Allowance not set for this contract for specified fee");
            require(tokenToPay.transferFrom(_from, address(this), amount), "Unsuccessful token transfer");
        }
    }
}
