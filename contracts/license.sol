pragma solidity ^0.5.0;

import "./ownable.sol";

contract License is Ownable {
    address payable recipient;
    uint256 price;

    mapping(address => uint256) licenseOwners;

    constructor(address payable _recipient, uint256 _price) public {
        recipient = _recipient;
        price = _price;
    }

    function isLicenseOwners() public view returns (bool) {
        return licenseOwners[msg.sender] != 0;
    }

    function buy() public payable {
        require(msg.value == price, "Value is not equal to expected price");
        require(licenseOwners[msg.sender] == 0, "License already bought");

        licenseOwners[msg.sender] = msg.value;
        recipient.transfer(msg.value);
    }

    function getRecipient() public view returns (address) {
        return recipient;
    }

    function setRecipient(address payable _recipient) public onlyOwner {
        recipient = _recipient;
    }

    function getPrice() public view returns (uint256) {
        return price;
    }

    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
    }
}
