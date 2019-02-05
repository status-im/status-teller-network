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
        uint256 offerId,
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
        address statusContractCode;
        string location;
        string username;
    }

    struct Offer {
        address asset;
        string currency;
        uint8 margin;
        PaymenMethods[] paymentMethods;
        MarketType marketType;
    }

    address public license;
    Seller[] public sellers;
    Offer[] public offers;
    mapping(address => bool) public sellerWhitelist;
    mapping(address => uint256) public addressToSeller;

    mapping(address => mapping (uint256 => bool)) public offerWhitelist;
    mapping(address => uint256[]) public addressToOffers;

    constructor(address _license) public {
        license = _license;
    }

    function setLicense(address _license) public onlyOwner {
        license = _license;
    }

    /**
    * @dev Add a new offer with a new seller if needed to the list
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

        if (!sellerWhitelist[msg.sender]) {
            Seller memory seller = Seller(_statusContractCode, _location, _username);
            uint256 sellerId = sellers.push(seller) - 1;
            addressToSeller[msg.sender] = sellerId;
            sellerWhitelist[msg.sender] = true;
        } else {
            Seller storage tmpSeller = sellers[addressToSeller[msg.sender]];
            tmpSeller.statusContractCode = _statusContractCode;
            tmpSeller.location = _location;
            tmpSeller.username = _username;
        }
        
        Offer memory offer = Offer(_asset, _currency, _margin, _paymentMethods, _marketType);
        uint256 offerId = offers.push(offer) - 1;
        offerWhitelist[msg.sender][offerId] = true;
        addressToOffers[msg.sender].push(offerId);

        emit Added(msg.sender, offerId, _asset, _statusContractCode, _location, _currency, _username, _paymentMethods, _marketType, _margin);
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
        uint256 _offerId,
        address _asset,
        address _statusContractCode,
        string memory _location,
        string memory _currency,
        string memory _username,
        PaymenMethods[] memory _paymentMethods,
        MarketType _marketType,
        uint8 _margin
    ) public {
        require(sellerWhitelist[msg.sender], "Seller do not exists");
        require(offerWhitelist[msg.sender][_offerId], "Offer do not exists");
        require(_margin <= 100, "Margin too high");

        Seller storage tmpSeller = sellers[addressToSeller[msg.sender]];
        tmpSeller.statusContractCode = _statusContractCode;
        tmpSeller.location = _location;
        tmpSeller.username = _username;
        
        offers[_offerId].asset = _asset;
        offers[_offerId].currency = _currency;
        offers[_offerId].paymentMethods = _paymentMethods;
        offers[_offerId].marketType = _marketType;
        offers[_offerId].margin = _margin;

        emit Updated(msg.sender, _offerId, _asset, _statusContractCode, _location, _currency, _username, _paymentMethods, _marketType, _margin);
    }

    /**
    * @dev Get the size of the sellers
    */
    function sellersSize() public view returns (uint256) {
        return sellers.length;
    }

    /**
    * @dev Get the size of the offers
    */
    function offersSize() public view returns (uint256) {
        return offers.length;
    }

    /**
    * @dev Fallback function
    */
    function() external {
    }
}