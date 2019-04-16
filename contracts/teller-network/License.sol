pragma solidity  ^0.5.7;

import "../common/Ownable.sol";
import "../token/ERC20Token.sol";
import "../token/ApproveAndCallFallBack.sol";

/**
* @title License
* @dev License contract for buying a license
*/
contract License is Ownable, ApproveAndCallFallBack {
    address payable private recipient;
    uint256 private price;
    uint256 private releaseDelay;
    string private constant LICENSE_ALREADY_BOUGHT = "License already bought";
    string private constant UNSUCCESSFUL_TOKEN_TRANSFER = "Unsuccessful token transfer";

    ERC20Token token;

    struct LicenseDetails {
        uint price;
        uint creationTime;
    }

    mapping(address => LicenseDetails) private licenseDetails;

    address[] public licenseOwners;
    mapping(address => uint) private idxLicenseOwners;

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
        reserveAmount = 0;
        token = ERC20Token(_tokenAddress);
    }

    /**
    * @dev Check if the address already owns a license
    * @param _address The address to check
    * @return bool
    */
    function isLicenseOwner(address _address) public view returns (bool) {
        return licenseDetails[_address].price != 0 && licenseDetails[_address].creationTime > 0;
    }

    /**
    * @dev Buy a license
    * @notice Requires value to be equal to the price of the license.
    *         The msg.sender must not already own a license.
    */
    function buy() public {
        buyFrom(msg.sender);
    }

    /**
    * @dev Buy a license
    * @notice Requires value to be equal to the price of the license.
    *         The _owner must not already own a license.
    */
    function buyFrom(address _owner) private {
        require(licenseDetails[_owner].creationTime == 0, LICENSE_ALREADY_BOUGHT);
        require(token.allowance(_owner, address(this)) >= price, "Allowance not set for this contract to expected price");
        require(token.transferFrom(_owner, address(this), price), UNSUCCESSFUL_TOKEN_TRANSFER);

        licenseDetails[_owner].price = price;
        licenseDetails[_owner].creationTime = block.timestamp;
        reserveAmount += price;

        uint idx = licenseOwners.push(msg.sender);
        idxLicenseOwners[msg.sender] = idx;

        emit Bought(_owner, token.allowance(_owner, address(this)));
    }

    /**
    * @dev Release a license and retrieve funds
    * @notice Only the owner of a license can perform the operation after the release delay time has passed.
    */
    function release() public {
        require(licenseDetails[msg.sender].creationTime > 0, LICENSE_ALREADY_BOUGHT);
        require(licenseDetails[msg.sender].creationTime + releaseDelay < block.timestamp, "Release period not reached.");

        uint price = licenseDetails[msg.sender].price;

        reserveAmount -= price;

        uint256 position = idxLicenseOwners[msg.sender];
        delete idxLicenseOwners[msg.sender];
        address replacer = licenseOwners[licenseOwners.length - 1];
        licenseOwners[position] = replacer;
        idxLicenseOwners[replacer] = position;
        licenseOwners.length--;

        delete licenseDetails[msg.sender];

        require(token.transfer(msg.sender, price), UNSUCCESSFUL_TOKEN_TRANSFER);

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
     * @dev Get number of license owners
     * @return uint
     */
    function getNumLicenseOwners() public view returns (uint256) {
        return licenseOwners.length;
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
    function withdrawExcessBalance(address _token, address payable _beneficiary) external onlyOwner {
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
    }


    /**
     * @notice Support for "approveAndCall". Callable only by `token()`.
     * @param _from Who approved.
     * @param _amount Amount being approved, need to be equal `getPrice()`.
     * @param _token Token being approved, need to be equal `token()`.
     * @param _data Abi encoded data with selector of `register(bytes32,address,bytes32,bytes32)`.
     */
    function receiveApproval(address _from, uint256 _amount, address _token, bytes memory _data) public {
        require(_amount == price, "Wrong value");
        require(_token == address(token), "Wrong token");
        require(_token == address(msg.sender), "Wrong call");
        require(_data.length == 4, "Wrong data length");

        bytes4 sig = abiDecodeRegister(_data);

        require(
            sig == bytes4(0xa6f2ae3a), //bytes4(keccak256("buy()"))
            "Wrong method selector"
        );

        buyFrom(_from);
    }


    /**
     * @dev Decodes abi encoded data with selector for "buy()".
     * @param _data Abi encoded data.
     * @return Decoded registry call.
     */
    function abiDecodeRegister(bytes memory _data) private pure returns(bytes4 sig) {
        assembly {
            sig := mload(add(_data, add(0x20, 0)))
        }
    }


    /**
    * @dev Fallback function
    */
    function() external {
    }
}
