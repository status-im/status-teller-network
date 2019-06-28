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
     * @notice Release fee to fee destination and arbitrator
     * @param _arbitrator Arbitrator address to transfer fee to
     * @param _value Value sold in the escrow
     * @param _isDispute Boolean telling if it was from a dispute. With a dispute, the arbitrator gets more
    */
    function releaseFee(address payable _arbitrator, uint _value, address _tokenAddress, bool _isDispute) internal {
        uint _milliPercentToArbitrator;
        if (_isDispute) {
            _milliPercentToArbitrator = 100000; // 100%
        } else {
            _milliPercentToArbitrator = 10000; // 10%
        }

        uint feeAmount = getValueOffMillipercent(_value, feeMilliPercent);
        uint arbitratorValue = getValueOffMillipercent(feeAmount, _milliPercentToArbitrator);
        uint destinationValue = feeAmount - arbitratorValue;

        if (_tokenAddress != address(0)) {
            ERC20Token tokenToPay = ERC20Token(_tokenAddress);
            // Arbitrator transfer
            require(tokenToPay.transfer(_arbitrator, arbitratorValue), "Unsuccessful token transfer abri");
            if (destinationValue > 0) {
                require(tokenToPay.transfer(feeDestination, destinationValue), "Unsuccessful token transfer destination");
            }
        } else {
            _arbitrator.transfer(arbitratorValue);
            if (destinationValue > 0) {
                feeDestination.transfer(destinationValue);
            }
        }
    }

    function getValueOffMillipercent(uint _value, uint _milliPercent) internal returns(uint) {
        // To get the factor, we divide like 100 like a normal percent, but we multiply that by 1000 because it's a milliPercent
        // Eg: 1 % = 1000 millipercent => Factor is 0.01, so 1000 divided by 100 * 1000
        return (_value * _milliPercent) / (100 * 1000);
    }

    /**
     * @notice Pay fees for a transaction or element id
     * @param _from Address from where the fees are being extracted
     * @param _id Escrow id or element identifier to mark as paid
     * @param _value Value sold in the escrow
     * @param _tokenAddress Address of the token sold in the escrow
     * @dev This will only transfer funds if the fee  has not been paid
     */
    function _payFee(address _from, uint _id, uint _value, address _tokenAddress) internal {
        if (feePaid[_id]) return;

        feePaid[_id] = true;
        uint feeAmount = getValueOffMillipercent(_value, feeMilliPercent);
        feeTokenBalances[_tokenAddress] += feeAmount;

        if (_tokenAddress != address(0)) {
            ERC20Token tokenToPay = ERC20Token(_tokenAddress);
            require(tokenToPay.transferFrom(_from, address(this), feeAmount), "Unsuccessful token transfer pay fee");
        } else {
            require(msg.value == (_value + feeAmount), "ETH amount is required");
        }
    }
}
