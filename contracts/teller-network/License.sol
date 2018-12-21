pragma solidity ^0.5.0;

import "../common/Ownable.sol";
import "../token/ERC20Token.sol";

/**
* @title License
* @dev License contract for buying a license
*/
contract License is Ownable {
    address payable private recipient;
    uint256 private price;
    uint256 private releaseDelay;

    ERC20Token token;

    struct LicenseDetails {
        uint price;
        uint creationTime;
    }

    mapping(address => LicenseDetails) private licenseOwners;

    event Bought(address buyer, uint256 price);
    event RecipientChanged(address _recipient);
    event PriceChanged(uint256 _price);
    event Released(address buyer);
    event ReleaseDelayChanged(uint256 _newDelay);

    uint256 public reserveAmount;



    constructor(address payable _tokenAddress, address payable _recipient, uint256 _price, uint256 _releaseDelay) public {
        recipient = _recipient;
        price = _price;
        releaseDelay = _releaseDelay;
        token = ERC20Token(_tokenAddress);
    }

    /**
    * @dev Check is the address already owns a license
    * @param _address The address to check
    * @return bool
    */
    function isLicenseOwner(address _address) public view returns (bool) {
        return licenseOwners[_address].price != 0 && licenseOwners[_address].creationTime > 0;
    }

    /**
    * @dev Buy a license
    * @notice Requires value to be equal to the price of the license.
    *         The buyers must not already own a license.
    */
    function buy() public {
        require(licenseOwners[msg.sender].creationTime == 0, "License already bought");
        require(token.allowance(msg.sender, address(this)) >= price, "Allowance not set for this contract to expected price");
        require(token.transferFrom(msg.sender, address(this), price), "Unsuccessful token transfer");

        licenseOwners[msg.sender].price = price;
        licenseOwners[msg.sender].creationTime = block.timestamp;

        reserveAmount += price;

        emit Bought(msg.sender, price);
    }

    /**
    * @dev Release a license and retrieve funds
    * @notice Only the owner of a license can perform the operation after the release delay time has passed.
    */
    function release() public { 
        require(licenseOwners[msg.sender].creationTime > 0, "License already bought");
        require(licenseOwners[msg.sender].creationTime + releaseDelay < block.timestamp, "Release period not reached.");
        require(token.transfer(msg.sender, licenseOwners[msg.sender].price), "Unsuccessful token transfer");

        reserveAmount -= licenseOwners[msg.sender].price;

        delete licenseOwners[msg.sender];

        emit Released(msg.sender);
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
    * @return uint
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
    * @dev Get the current release delay time in seconds
    * @return uint
    */
    function getReleaseDelay() public view returns (uint256) {
        return releaseDelay;
    }

    /**
    * @dev Set the minimum amount of time before a license can be released
    * @param _releaseDelay The new release delay in seconds
    * @notice Only the owner of the contract can perform this action
    */
    function setReleaseDelay(uint256 _releaseDelay) public onlyOwner {
        releaseDelay = _releaseDelay;
        emit ReleaseDelayChanged(releaseDelay);
    }

    /**
     * @notice Withdraw not reserved tokens
     * @param _token Address of ERC20 withdrawing excess, or address(0) if want ETH.
     * @param _beneficiary Address to send the funds.
     **/
    function withdrawExcessBalance(
        address _token,
        address _beneficiary
    )
        external 
        onlyController 
    {
        require(_beneficiary != address(0), "Cannot burn token");
        if (_token == address(0)) {
            _beneficiary.transfer(address(this).balance);
        } else {
            ERC20Token excessToken = ERC20Token(_token);
            uint256 amount = excessToken.balanceOf(address(this));
            if(_token == address(token)){
                require(amount > reserveAmount, "Is not excess");
                amount -= reserveAmount;
            } else {
                require(amount > 0, "No balance");
            }
            excessToken.transfer(_beneficiary, amount);
        }


    /**
    * @dev Fallback function
    */
    function() external {
    }
}
