pragma solidity >=0.5.0 <0.6.0;

import "./Ownable.sol";
import "../token/ERC20Token.sol";
import "../token/SafeTransfer.sol";
import "./Stakable.sol";



contract StakableV2 is Stakable {
    
    constructor(address payable _burnAddress) public {
        burnAddress = _burnAddress;
    }

    function _stake(uint _itemId, address payable _owner, address _tokenAddress) internal {
        require(stakes[_itemId].owner == address(0), "Already has/had a stake");

        uint stakeAmount = getAmountToStake(msg.sender);
        require(msg.value >= stakeAmount, "More ETH is required");

        stakeCounter[_owner]++;
        // Using only ETH as stake for phase 0
        _tokenAddress = address(0);


        stakes[_itemId].amount = msg.value;
        stakes[_itemId].owner = _owner;
        stakes[_itemId].token = _tokenAddress;

        emit Staked(_itemId,  _owner, stakeAmount);
    }
}