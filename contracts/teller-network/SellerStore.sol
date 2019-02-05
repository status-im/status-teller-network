pragma solidity ^0.5.0;

import "./License.sol";
import "../common/Ownable.sol";

/**
* @title SellerStore
* @dev Store Seller metadata
*/
contract SellerStore is Ownable {

    enum PaymenMethods {Cash,BankTransfer,InternationalWire}
    enum MarketType {Above, Below}

    event Added(
        address owner,
        uint256 id,
        address asset,
        address statusContractCode,
        string location,
        string currency,
        string username,
        PaymenMethods[] paymentMethods,
        MarketType marketType,
        uint8 margin
    );

    event Updated(
        address owner,
        uint256 id,
        address asset,
        address statusContractCode,
        string location,
        string currency,
        string username,
        PaymenMethods[] paymentMethods,
        MarketType marketType,
        uint8 margin
    );

    struct Seller {
        address asset;
        address statusContractCode;
        string location;
        string currency;
        string username;
        PaymenMethods[] paymentMethods;
        MarketType marketType;
        uint8 margin;
    }

    address public license;
    Seller[] public sellers;
    mapping(address => mapping (uint256 => bool)) public ownerToSellers;

    constructor(address _license) public {
        license = _license;
    }

    function setLicense(address _license) public onlyOwner {
        license = _license;
    }

    /**
    * @dev Add a seller to the list
    * @param _asset The address of the erc20 to exchange, pass 0x0 for Eth
    * @param _statusContractCode The address of the status contract
    * @param _location The location on earth
    * @param _currency The currency the seller want to receive (USD, EUR...)
    * @param _username The username of the seller
    * @param _paymentMethods The list of the payment methods the seller accept
    * @param _marketType Above or Below
    * @param _margin The margin for the seller from 0 to 100
    */
    function add(
        address _asset,
        address _statusContractCode,
        string memory _location,
        string memory _currency,
        string memory _username,
        PaymenMethods[] memory _paymentMethods,
        MarketType _marketType,
        uint8 _margin
    ) public {
        require(License(license).isLicenseOwner(msg.sender), "Not a license owner");
        require(_margin <= 100, "Margin too high");
        Seller memory seller = Seller(
            _asset, _statusContractCode, _location, _currency, _username, _paymentMethods, _marketType, _margin
        );
        uint256 id = sellers.push(seller) - 1;
        ownerToSellers[msg.sender][id] = true;

        emit Added(msg.sender, id, _asset, _statusContractCode, _location, _currency, _username, _paymentMethods, _marketType, _margin);
    }

    /**
    * @dev Update the seller
    * @param _asset The address of the erc20 to exchange, pass 0x0 for Eth
    * @param _statusContractCode The address of the status contract
    * @param _location The location on earth
    * @param _currency The currency the seller want to receive (USD, EUR...)
    * @param _username The username of the seller
    * @param _paymentMethods The list of the payment methods the seller accept
    * @param _marketType Above or Below
    * @param _margin The margin for the seller from 0 to 100
    */
    function update(
        uint256 _id,
        address _asset,
        address _statusContractCode,
        string memory _location,
        string memory _currency,
        string memory _username,
        PaymenMethods[] memory _paymentMethods,
        MarketType _marketType,
        uint8 _margin
    ) public {
        require(ownerToSellers[msg.sender][_id], "Seller owner do not match");
        require(_margin <= 100, "Margin too high");

        sellers[_id].asset = _asset;
        sellers[_id].statusContractCode = _statusContractCode;
        sellers[_id].location = _location;
        sellers[_id].currency = _currency;
        sellers[_id].username = _username;
        sellers[_id].paymentMethods = _paymentMethods;
        sellers[_id].marketType = _marketType;
        sellers[_id].margin = _margin;

        emit Updated(msg.sender, _id, _asset, _statusContractCode, _location, _currency, _username, _paymentMethods, _marketType, _margin);
    }

    /**
    * @dev Get the size of the sellers
    */
    function size() public view returns (uint256) {
        return sellers.length;
    }

    /**
    * @dev Fallback function
    */
    function() external {
    }
}
