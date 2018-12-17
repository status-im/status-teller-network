pragma solidity ^0.5.0;

import "./ownable.sol";

/**
* @title License
* @dev License contract for buying a license
*/
contract License is Ownable {
    address payable private recipient;
    uint256 private price;

    mapping(address => uint256) private licenseOwners;

    event Bought(address buyer, uint256 price);
    event RecipientChanged(address _recipient);
    event PriceChanged(uint256 _price);

    constructor(address payable _recipient, uint256 _price) public {
        recipient = _recipient;
        price = _price;
    }

    /**
    * @dev Check is the address already owns a license
    * @param _address The address to check
    * @return bool
    */
    function isLicenseOwner(address _address) public view returns (bool) {
        return licenseOwners[_address] != 0;
    }

    /**
    * @dev Buy a license
    * @notice Requires value to be equal to the price of the license.
    *         The buyers must not already own a license.
    */
    function buy() public payable {
        require(msg.value == price, "Value is not equal to expected price");
        require(licenseOwners[msg.sender] == 0, "License already bought");

        licenseOwners[msg.sender] = msg.value;
        recipient.transfer(msg.value);
        emit Bought(msg.sender, msg.value);
    }

    /**
    * @dev Get the recipient of the license
    * @return address
    */
    function getRecipient() public view returns (address) {
        return recipient;
    }

    /**
    * @dev Set the recipient
    * @param _recipient The new recipient of the license
    * @notice Only the owner of the contract can perform this action
    */
    function setRecipient(address payable _recipient) public onlyOwner {
        recipient = _recipient;
        emit RecipientChanged(_recipient);
    }

    /**
    * @dev Get the current price of the license
    * @return address
    */
    function getPrice() public view returns (uint256) {
        return price;
    }

    /**
    * @dev Set the price
    * @param _price The new price of the license
    * @notice Only the owner of the contract can perform this action
    */
    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
        emit PriceChanged(_price);
    }

    /**
    * @dev Fallback function
    */
    function() external {
    }
}
