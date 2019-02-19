pragma solidity ^0.5.0;

import "./License.sol";
import "../common/Ownable.sol";

/**
* @title MetadataStore
* @dev Metadata store
*/
contract MetadataStore is Ownable {

    enum PaymenMethods {Cash,BankTransfer,InternationalWire}
    enum MarketType {Above, Below}
    enum OfferStatus {Open}

    event OfferAdded(
        address owner,
        uint256 offerId,
        address asset,
        address statusContactCode,
        string location,
        string currency,
        string username,
        PaymenMethods[] paymentMethods,
        MarketType marketType,
        uint8 margin,
        OfferStatus status
    );

    event OfferUpdated(
        address owner,
        uint256 id,
        address asset,
        address statusContactCode,
        string location,
        string currency,
        string username,
        PaymenMethods[] paymentMethods,
        MarketType marketType,
        uint8 margin
    );

    event UserUpdated(
        address owner,
        address statusContactCode,
        string location,
        string username
    );

    struct User {
        address statusContactCode;
        string location;
        string username;
    }

    struct Offer {
        address asset;
        string currency;
        uint8 margin;
        PaymenMethods[] paymentMethods;
        MarketType marketType;
        OfferStatus status;
    }

    address public license;
    User[] public users;
    Offer[] public offers;

    mapping(address => bool) public userWhitelist;
    mapping(address => uint256) public addressToUser;

    mapping(address => mapping (uint256 => bool)) public offerWhitelist;
    mapping(address => uint256[]) public addressToOffers;

    constructor(address _license) public {
        license = _license;
    }

    function setLicense(address _license) public onlyOwner {
        license = _license;
    }

    /**
    * @dev Add a new offer with a new user if needed to the list
    * @param _asset The address of the erc20 to exchange, pass 0x0 for Eth
    * @param _statusContactCode The address of the status contact code
    * @param _location The location on earth
    * @param _currency The currency the user want to receive (USD, EUR...)
    * @param _username The username of the user
    * @param _paymentMethods The list of the payment methods the user accept
    * @param _marketType Above or Below
    * @param _margin The margin for the user from 0 to 100
    */
    function addOffer(
        address _asset,
        address _statusContactCode,
        string memory _location,
        string memory _currency,
        string memory _username,
        PaymenMethods[] memory _paymentMethods,
        MarketType _marketType,
        uint8 _margin
    ) public {
        require(License(license).isLicenseOwner(msg.sender), "Not a license owner");
        require(_margin <= 100, "Margin too high");

        if (!userWhitelist[msg.sender]) {
            User memory user = User(_statusContactCode, _location, _username);
            uint256 userId = users.push(user) - 1;
            addressToUser[msg.sender] = userId;
            userWhitelist[msg.sender] = true;
        } else {
            User storage tmpUser = users[addressToUser[msg.sender]];
            tmpUser.statusContactCode = _statusContactCode;
            tmpUser.location = _location;
            tmpUser.username = _username;
        }
        
        Offer memory offer = Offer(_asset, _currency, _margin, _paymentMethods, _marketType, OfferStatus.Open);
        uint256 offerId = offers.push(offer) - 1;
        offerWhitelist[msg.sender][offerId] = true;
        addressToOffers[msg.sender].push(offerId);

        emit OfferAdded(
            msg.sender, offerId, _asset, _statusContactCode, _location, _currency, _username, _paymentMethods, _marketType, _margin, OfferStatus.Open
        );
    }

    /**
    * @dev Update the user
    * @param _statusContactCode The address of the status contact code
    * @param _location The location on earth
    * @param _username The username of the user
    */
    function updateUser(
        address _statusContactCode,
        string memory _location,
        string memory _username
    ) public {
        require(userWhitelist[msg.sender], "User does not exist");

        User storage tmpUser = users[addressToUser[msg.sender]];
        tmpUser.statusContactCode = _statusContactCode;
        tmpUser.location = _location;
        tmpUser.username = _username;

        emit UserUpdated(msg.sender, _statusContactCode, _location, _username);
    }

    /**
    * @dev Update the user and offer
    * @param _asset The address of the erc20 to exchange, pass 0x0 for Eth
    * @param _statusContactCode The address of the status contact code
    * @param _location The location on earth
    * @param _currency The currency the user want to receive (USD, EUR...)
    * @param _username The username of the user
    * @param _paymentMethods The list of the payment methods the user accept
    * @param _marketType Above or Below
    * @param _margin The margin for the user from 0 to 100
    */
    function updateOffer(
        uint256 _offerId,
        address _asset,
        address _statusContactCode,
        string memory _location,
        string memory _currency,
        string memory _username,
        PaymenMethods[] memory _paymentMethods,
        MarketType _marketType,
        uint8 _margin
    ) public {
        require(userWhitelist[msg.sender], "User does not exist");
        require(offerWhitelist[msg.sender][_offerId], "Offer does not exist");
        require(_margin <= 100, "Margin too high");

        User storage tmpUser = users[addressToUser[msg.sender]];
        tmpUser.statusContactCode = _statusContactCode;
        tmpUser.location = _location;
        tmpUser.username = _username;
        
        offers[_offerId].asset = _asset;
        offers[_offerId].currency = _currency;
        offers[_offerId].paymentMethods = _paymentMethods;
        offers[_offerId].marketType = _marketType;
        offers[_offerId].margin = _margin;

        emit OfferUpdated(msg.sender, _offerId, _asset, _statusContactCode, _location, _currency, _username, _paymentMethods, _marketType, _margin);
    }

    /**
    * @dev Get the offer by Id
    */
    function offer(uint256 _id) public view returns (
        address,
        string memory,
        uint8,
        PaymenMethods[] memory,
        MarketType,
        OfferStatus
    ) {
        return (offers[_id].asset, offers[_id].currency, offers[_id].margin, offers[_id].paymentMethods, offers[_id].marketType, offers[_id].status);
    }

    /**
    * @dev Get the size of the users
    */
    function usersSize() public view returns (uint256) {
        return users.length;
    }

    /**
    * @dev Get the size of the offers
    */
    function offersSize() public view returns (uint256) {
        return offers.length;
    }

    /**
    * @dev Get all the offer ids of the address in params
    * @param _address Address of the offers
    */
    function getOfferIds(address _address) public view returns (uint256[] memory) {
        return addressToOffers[_address];
    }

    /**
    * @dev Fallback function
    */
    function() external {
    }
}
