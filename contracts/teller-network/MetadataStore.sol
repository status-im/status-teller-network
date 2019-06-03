pragma solidity ^0.5.7;

import "./License.sol";
import "../common/Ownable.sol";
import "../common/MessageSigned.sol";

/**
* @title MetadataStore
* @dev Metadata store
*/
contract MetadataStore is Ownable, MessageSigned {

    enum PaymentMethods {Cash,BankTransfer,InternationalWire}

    event OfferAdded(
        address owner,
        uint256 offerId,
        address asset,
        bytes statusContactCode,
        string location,
        string currency,
        string username,
        PaymentMethods[] paymentMethods,
        int8 margin
    );

    event OfferUpdated(
        address owner,
        uint256 id,
        address asset,
        bytes statusContactCode,
        string location,
        string currency,
        string username,
        PaymentMethods[] paymentMethods,
        int8 margin
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

    struct Offer {
        address asset;
        string currency;
        int8 margin;
        PaymentMethods[] paymentMethods;
        address payable owner;
        address arbitrator;
    }

    address public license;
    address public arbitration;
    address public escrow;

    User[] public users;
    Offer[] public offers;

    mapping(address => bool) public userWhitelist;
    mapping(address => uint256) public addressToUser;

    mapping(address => mapping (uint256 => bool)) public offerWhitelist;
    mapping(address => uint256[]) public addressToOffers;

    constructor(address _license, address _arbitration) public {
        license = _license;
        arbitration = _arbitration;
    }

    function setEscrowAddress(address _escrow) public onlyOwner {
        escrow = _escrow;
    }

    function setLicense(address _license) public onlyOwner {
        license = _license;
    }

    function setArbitration(address _arbitration) public onlyOwner {
        arbitration = _arbitration;
    }

    function getDataHash(string calldata _username, 
                         bytes calldata _statusContactCode, 
                         string calldata _location
            ) external view returns (bytes32) { 
        return dataHash(_username, _statusContactCode, _location);
    }

    function dataHash(string memory _username, 
                      bytes memory _statusContactCode, 
                      string memory _location
            ) internal view returns (bytes32) { 
        return keccak256(abi.encodePacked(address(this), _username, _statusContactCode, _location));
    }
    
    function getSigner(string memory _username, 
                    bytes memory _statusContactCode, 
                    string memory _location, 
                    bytes memory _signature
            ) internal returns(address) {
        return recoverAddress(getSignHash(dataHash(_username, _statusContactCode, _location)), _signature);
        // return recoverAddress(dataHash(_username, _statusContactCode, _location)11, _signature);

    }

    function getMessageSigner(string calldata _username, 
                    bytes calldata _statusContactCode, 
                    string calldata _location,
                    bytes calldata _signature
            ) external returns(address) {
        return getSigner(_username, _statusContactCode, _location, _signature);   
        }


    function addOrUpdateUser(
        bytes memory _signature,
        bytes memory _statusContactCode,
        string memory _location,
        string memory _username
    ) public returns(address payable _user) {
        // commented out this functionality as in the following implementation we 
        // are solving it through signatures
        
        // if(msg.sender == escrow){ 
        //     _user = msg.sender; 
        // } else {
            address _userSigned = getSigner(_username, _statusContactCode, _location, _signature);
            _user = address(uint160(_userSigned)); 
        // }
        if (!userWhitelist[_user]) {
            User memory user = User(_statusContactCode, _location, _username);
            uint256 userId = users.push(user) - 1;
            addressToUser[_user] = userId;
            userWhitelist[_user] = true;
        } else {
            User storage tmpUser = users[addressToUser[_user]];
            tmpUser.statusContactCode = _statusContactCode;
            tmpUser.location = _location;
            tmpUser.username = _username;
        }
        return _user;
    }

    /**
    * @dev Add a new offer with a new user if needed to the list
    * @param _asset The address of the erc20 to exchange, pass 0x0 for Eth
    * @param _statusContactCode The address of the status contact code
    * @param _location The location on earth
    * @param _currency The currency the user want to receive (USD, EUR...)
    * @param _username The username of the user
    * @param _paymentMethods The list of the payment methods the user accept
    * @param _margin The margin for the user from 0 to 100
    * @param _arbitrator The arbitrator used by the offer
    */
    function addOffer(
        address _asset,
        bytes memory _signature,       
        bytes memory _statusContactCode,
        string memory _location,
        string memory _currency,
        string memory _username,
        PaymentMethods[] memory _paymentMethods,
        int8 _margin,
        address _arbitrator
    ) public {
        require(License(license).isLicenseOwner(msg.sender), "Not a license owner");
        require(_margin <= 100, "Margin too high");
        require(_margin >= -100, "Margin too low");
        require(msg.sender != _arbitrator, "Cannot arbitrate own offers");

        address payable _user = this.addOrUpdateUser(_signature, _statusContactCode, _location, _username);

        Offer memory offer = Offer(_asset, _currency, _margin, _paymentMethods, _user, _arbitrator);
        uint256 offerId = offers.push(offer) - 1;
        offerWhitelist[msg.sender][offerId] = true;
        addressToOffers[msg.sender].push(offerId);

        emit OfferAdded(
            _user, offerId, _asset, _statusContactCode, _location, _currency, _username, _paymentMethods, _margin
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
    * @param _margin The margin for the user from 0 to 100
    * @param _arbitrator The arbitrator used by the offer
    */
    function updateOffer(
        uint256 _offerId,
        address _asset,
        bytes memory _statusContactCode,
        string memory _location,
        string memory _currency,
        string memory _username,
        PaymentMethods[] memory _paymentMethods,
        int8 _margin,
        address _arbitrator
    ) public {
        require(userWhitelist[msg.sender], "User does not exist");
        require(offerWhitelist[msg.sender][_offerId], "Offer does not exist");
        require(_margin <= 100, "Margin too high");
        require(_margin >= -100, "Margin too low");

        User storage tmpUser = users[addressToUser[msg.sender]];
        tmpUser.statusContactCode = _statusContactCode;
        tmpUser.location = _location;
        tmpUser.username = _username;

        offers[_offerId].asset = _asset;
        offers[_offerId].currency = _currency;
        offers[_offerId].paymentMethods = _paymentMethods;
        offers[_offerId].margin = _margin;
        offers[_offerId].arbitrator = _arbitrator;

        emit OfferUpdated(
            msg.sender, _offerId, _asset, _statusContactCode, _location, _currency, _username, _paymentMethods, _margin
        );
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
        int8 margin,
        PaymentMethods[] memory paymentMethods,
        address payable owner,
        address arbitrator
    ) {
        require(_id < offers.length, "Invalid offer id");

        return (
            offers[_id].asset,
            offers[_id].currency,
            offers[_id].margin,
            offers[_id].paymentMethods,
            offers[_id].owner,
            offers[_id].arbitrator
        );
    }

    function getOfferOwner(uint256 _id) public view returns (address payable) {
        require(_id < offers.length, "Invalid offer id");
        return (offers[_id].owner);
    }

    function getAsset(uint256 _id) public view returns (address) {
        require(_id < offers.length, "Invalid offer id");
        return (offers[_id].asset);
    }

    function getArbitrator(uint256 _id) public view returns (address) {
        require(_id < offers.length, "Invalid offer id");
        return (offers[_id].arbitrator);
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
