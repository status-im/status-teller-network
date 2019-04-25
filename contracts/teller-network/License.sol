pragma solidity  ^0.5.7;

import "../common/Ownable.sol";
import "../token/ERC20Token.sol";
import "../token/ApproveAndCallFallBack.sol";

/**
* @title License
* @dev Contract for buying a license
*/
contract License is Ownable, ApproveAndCallFallBack {
    uint256 public price;
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
    event PriceChanged(uint256 _price);

    constructor(address payable _tokenAddress, uint256 _price) public {
        price = _price;
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

        uint idx = licenseOwners.push(msg.sender);
        idxLicenseOwners[msg.sender] = idx;

        emit Bought(_owner, token.allowance(_owner, address(this)));
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
     * @dev Get number of license owners
     * @return uint
     */
    function getNumLicenseOwners() public view returns (uint256) {
        return licenseOwners.length;
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
            excessToken.transfer(_beneficiary, amount);
        }
    }


    /**
     * @notice Support for "approveAndCall". Callable only by `token()`.
     * @param _from Who approved.
     * @param _amount Amount being approved, need to be equal `price()`.
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
}
