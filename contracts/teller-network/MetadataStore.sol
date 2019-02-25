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

    event TradeAdded(
        uint256 tradeId,
        uint256 offerId,
        uint256 amount,
        address maker,
        address taker
    );

    event OfferAdded(
        address owner,
        uint256 offerId,
        address asset,
        bytes statusContactCode,
        string location,
        string currency,
        string username,
        PaymenMethods[] paymentMethods,
        MarketType marketType,
        uint8 margin
    );

    event OfferUpdated(
        address owner,
        uint256 id,
        address asset,
        bytes statusContactCode,
        string location,
        string currency,
        string username,
        PaymenMethods[] paymentMethods,
        MarketType marketType,
        uint8 margin
    );

    event OfferRemoved(
        address owner,
        uint256 offerId
    );

    event UserUpdated(
        address owner,
        bytes statusContactCode,
        string location,
        string username
    );

    struct User {
        bytes statusContactCode;
        string location;
        string username;
    }

    struct Trade {
        uint256 offerId;
        address maker;
        address taker;
        uint256 amount;
    }

    struct Offer {
        address asset;
        string currency;
        uint8 margin;
        PaymenMethods[] paymentMethods;
        MarketType marketType;
        address owner;
    }

    address public license;
    User[] public users;
    Trade[] public trades;
    Offer[] public offers;

    mapping(address => bool) public userWhitelist;
    mapping(address => uint256) public addressToUser;

    mapping(address => mapping (uint256 => bool)) public offerWhitelist;
    mapping(address => uint256[]) public addressToOffers;

    mapping(address => uint256[]) public makerToTrades;
    mapping(address => uint256[]) public takerToTrades;

    constructor(address _license) public {
        license = _license;
    }

    function setLicense(address _license) public onlyOwner {
        license = _license;
    }

    /**
    * @dev Add a new trade with a new user for the maker if needed to the list
    * @param _statusContactCode The address of the status contact code
    * @param _username The username of the user
    * @param _amount Then amount of token/eth you request
    * @param _offerId The offer id you want to create the trade from
    */
    function addTrade(
        bytes memory _statusContactCode,
        string memory _username,
        uint256 _amount,
        uint256 _offerId
    ) public {
        require(offers[_offerId].owner != address(0x0), "Offer do not exist");
        Offer storage offer = offers[_offerId];

        if (!userWhitelist[msg.sender]) {
            User memory user = User(_statusContactCode, "", _username);
            uint256 userId = users.push(user) - 1;
            addressToUser[msg.sender] = userId;
            userWhitelist[msg.sender] = true;
        } else {
            User storage tmpUser = users[addressToUser[msg.sender]];
            tmpUser.statusContactCode = _statusContactCode;
            tmpUser.username = _username;
        }
        
        Trade memory trade = Trade(_offerId, msg.sender, offer.owner, _amount);
        uint256 tradeId = trades.push(trade) - 1;
        makerToTrades[msg.sender].push(tradeId);
        takerToTrades[offer.owner].push(tradeId);

        emit TradeAdded(
            tradeId,
            _offerId,
            _amount,
            msg.sender,
            offer.owner
        );
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
        bytes memory _statusContactCode,
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
        
        Offer memory offer = Offer(_asset, _currency, _margin, _paymentMethods, _marketType, msg.sender);
        uint256 offerId = offers.push(offer) - 1;
        offerWhitelist[msg.sender][offerId] = true;
        addressToOffers[msg.sender].push(offerId);

        emit OfferAdded(
            msg.sender, offerId, _asset, _statusContactCode, _location, _currency, _username, _paymentMethods, _marketType, _margin
        );
    }

    /**
    * @dev Update the user
    * @param _statusContactCode The address of the status contact code
    * @param _location The location on earth
    * @param _username The username of the user
    */
    function updateUser(
        bytes memory _statusContactCode,
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
        bytes memory _statusContactCode,
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
    * @notice Remove user offer
    * @param _offerId Id of the offer to remove
    */
    function removeOffer(
        uint256 _offerId
    ) public {
        require(userWhitelist[msg.sender], "User does not exist");
        require(offerWhitelist[msg.sender][_offerId], "Offer does not exist");

        delete offers[_offerId];
        offerWhitelist[msg.sender][_offerId] = false;
        emit OfferRemoved(msg.sender, _offerId);
    }

    /**
    * @dev Get the offer by Id
    */
    function offer(uint256 _id) public view returns (
        address asset,
        string memory currency,
        uint8 margin,
        PaymenMethods[] memory paymentMethods,
        MarketType marketType,
        address owner
    ) {
        return (
            offers[_id].asset,
            offers[_id].currency,
            offers[_id].margin,
            offers[_id].paymentMethods,
            offers[_id].marketType,
            offers[_id].owner
        );
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
    * @param _address Address of the owner
    */
    function getOfferIds(address _address) public view returns (uint256[] memory) {
        return addressToOffers[_address];
    }

    /**
    * @dev Get all the trade maker ids of the address in params
    * @param _address Address of the maker
    */
    function getMakerTradeIds(address _address) public view returns (uint256[] memory) {
        return makerToTrades[_address];
    }

    /**
    * @dev Get all the trade taker ids of the address in params
    * @param _address Address of the maker
    */
    function getTakerTradeIds(address _address) public view returns (uint256[] memory) {
        return takerToTrades[_address];
    }

    /**
    * @dev Fallback function
    */
    function() external {
    }
}
