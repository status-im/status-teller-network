pragma solidity >=0.5.0 <0.6.0;

import "../common/Ownable.sol";
import "../token/ERC20Token.sol";

contract Stakable is Ownable {

    uint public basePrice = 0.01 ether;

    address payable public burnAddress;

    struct Stake {
        uint amount;
        address payable owner;
        address token;
    }

    mapping(uint => Stake) stakes;
    mapping(address => uint) stakeCounter;

    event BurnAddressChanged(address sender, address prevBurnAddress, address newBurnAddress);
    event BasePriceChanged(address sender, uint prevPrice, uint newPrice);

    event Staked(uint indexed itemId, address indexed owner, uint amount);
    event Unstaked(uint indexed itemId, address indexed owner, uint amount);
    event Slashed(uint indexed itemId, address indexed owner, address indexed slasher, uint amount);

    constructor(address payable _burnAddress) public {
        burnAddress = _burnAddress;
    }

    /**
     * @dev Changes the burn address
     * @param _burnAddress New burn address
     */
    function setBurnAddress(address payable _burnAddress) external onlyOwner {
        emit BurnAddressChanged(msg.sender, burnAddress, _burnAddress);
        burnAddress = _burnAddress;
    }

    /**
     * @dev Changes the base price
     * @param _basePrice New burn address
     */
    function setBasePrice(uint _basePrice) external onlyOwner {
        emit BasePriceChanged(msg.sender, basePrice, _basePrice);
        basePrice = _basePrice;
    }

    function _stake(uint _itemId, address payable _owner, address _tokenAddress) internal {
        require(stakes[_itemId].amount == 0, "Already has an stake");

        stakeCounter[_owner]++;

        uint stakeAmount = basePrice * stakeCounter[_owner] * stakeCounter[_owner]; // y = basePrice * x^2

        // Using only ETH as stake for phase 0
        _tokenAddress = address(0);
        require(msg.value == stakeAmount, "ETH amount is required");

        // Uncomment to support tokens
        /*
        if (_tokenAddress != address(0)) {
            require(msg.value == 0, "Cannot send ETH with token address different from 0");
            ERC20Token tokenToPay = ERC20Token(_tokenAddress);
            require(tokenToPay.transferFrom(_owner, address(this), stakeAmount), "Unsuccessful token transfer");
        } else {
            require(msg.value == stakeAmount, "ETH amount is required");
        }
        */

        stakes[_itemId].amount = stakeAmount;
        stakes[_itemId].owner = _owner;
        stakes[_itemId].token = _tokenAddress;

        emit Staked(_itemId,  _owner, stakeAmount);
    }

    function getAmountToStake(address _owner) public view returns(uint){
        uint stakeCnt = stakeCounter[_owner] + 1;
        return basePrice * stakeCnt * stakeCnt; // y = basePrice * x^2
    }

    function _unstake(uint _itemId) internal {
        Stake storage s = stakes[_itemId];

        if (s.amount == 0) return; // No stake for item

        if (s.token == address(0)) {
            s.owner.transfer(s.amount);
        } else {
            require(ERC20Token(s.token).transfer(s.owner, s.amount), "Couldn't transfer funds");
        }

        assert(stakeCounter[s.owner] > 0);

        stakeCounter[s.owner]--;

        emit Unstaked(_itemId, s.owner, s.amount);

        s.amount = 0;
    }

    function _slash(uint _itemId) internal {
        Stake storage s = stakes[_itemId];

        // TODO: what happens if offer was previosly validated and the user removed the stake?
        if (s.amount == 0) return;

        if (s.token == address(0)) {
            burnAddress.transfer(s.amount);
        } else {
            require(ERC20Token(s.token).transfer(burnAddress, s.amount), "Couldn't transfer funds");
        }

        emit Slashed(_itemId, s.owner, msg.sender, s.amount);

        s.amount = 0;
    }

    function _refundStake(uint _itemId) internal {
        Stake storage s = stakes[_itemId];

        if (s.token == address(0)) {
            s.owner.transfer(s.amount);
        } else {
            require(ERC20Token(s.token).transfer(s.owner, s.amount), "Couldn't transfer funds");
        }

        stakeCounter[s.owner]--;
    }

}