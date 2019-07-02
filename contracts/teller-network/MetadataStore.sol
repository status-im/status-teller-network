pragma solidity >=0.5.0 <0.6.0;

import "./License.sol";
import "./ArbitratorLicense.sol";
import "../common/MessageSigned.sol";

/**
* @title MetadataStore
* @dev User and offers registry
*/
contract MetadataStore is MessageSigned {

    enum PaymentMethods {Cash,BankTransfer,InternationalWire}

    struct User {
        bytes statusContactCode;
        string location;
        string username;
    }

    struct Offer {
        int8 margin;
        PaymentMethods[] paymentMethods;
        address asset;
        string currency;
        address payable owner;
        address payable arbitrator;
        bool deleted;
    }

    License public sellingLicenses;
    ArbitratorLicense public arbitrationLicenses;

    User[] public users;
    mapping(address => bool) public userWhitelist;
    mapping(address => uint256) public addressToUser;
    mapping(address => uint) public user_nonce;

    Offer[] public offers;
    mapping(address => uint256[]) public addressToOffers;
    mapping(address => mapping (uint256 => bool)) public offerWhitelist;

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

    event OfferRemoved(address owner, uint256 offerId);

    event UserUpdated(address owner, bytes statusContactCode, string location, string username);

    /**
     * @param _sellingLicenses Sellers licenses contract address
     * @param _arbitrationLicenses Arbitrators licenses contract address
     */
    constructor(address _sellingLicenses, address _arbitrationLicenses) public {
        sellingLicenses = License(_sellingLicenses);
        arbitrationLicenses = ArbitratorLicense(_arbitrationLicenses);
    }

    /**
     * @dev Get datahash to be signed
     * @param _username Username
     * @param _statusContactCode Status Whisper Public Key (65bytes hex)
     * @param _nonce Nonce value (obtained from user_nonce)
     * @return bytes32 to sign
     */
    function _dataHash(string memory _username, bytes memory _statusContactCode, uint _nonce) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this), _username, _statusContactCode, _nonce));
    }

    /**
     * @notice Get datahash to be signed
     * @param _username Username
     * @param _statusContactCode Status Whisper Public Key (65bytes hex)
     * @return bytes32 to sign
     */
    function getDataHash(string calldata _username, bytes calldata _statusContactCode) external view returns (bytes32) {
        return _dataHash(_username, _statusContactCode, user_nonce[msg.sender]);
    }

    /**
     * @dev Get signer address from signature. This uses the signature parameters to validate the signature
     * @param _username Status username
     * @param _statusContactCode Status Contact Code
     * @param _nonce User nonce
     * @param _signature Signature obtained from the previous parameters
     * @return Signing user address
     */
    function _getSigner(
        string memory _username,
        bytes memory _statusContactCode,
        uint _nonce,
        bytes memory _signature
    ) internal view returns(address) {
        bytes32 signHash = _getSignHash(_dataHash(_username, _statusContactCode, _nonce));
        return _recoverAddress(signHash, _signature);
    }

    /**
     * @notice Get signer address from signature
     * @param _username Status username
     * @param _statusContactCode Status Contact Code
     * @param _nonce User nonce
     * @param _signature Signature obtained from the previous parameters
     * @return Signing user address
     */
    function getMessageSigner(
        string calldata _username,
        bytes calldata _statusContactCode,
        uint _nonce,
        bytes calldata _signature
    ) external view returns(address) {
        return _getSigner(_username, _statusContactCode, _nonce, _signature);
    }

    /**
     * @dev Adds or updates user information
     * @param _user User address to update
     * @param _statusContactCode New status contact code
     * @param _location New location
     * @param _username New status username
     */
    function _addOrUpdateUser(
        address _user,
        bytes memory _statusContactCode,
        string memory _location,
        string memory _username
    ) internal {
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
    }

    /**
     * @notice Adds or updates user information via signature
     * @param _signature Signature
     * @param _statusContactCode New status contact code
     * @param _location New location
     * @param _username New status username
     * @return Signing user address
     */
    function addOrUpdateUser(
        bytes calldata _signature,
        bytes calldata _statusContactCode,
        string calldata _location,
        string calldata _username,
        uint _nonce
    ) external returns(address payable _user) {
        _user = address(uint160(_getSigner(_username, _statusContactCode, _nonce, _signature)));
        
        require(_nonce == user_nonce[_user], "Invalid nonce");

        user_nonce[_user]++;
        _addOrUpdateUser(_user, _statusContactCode, _location, _username);

        return _user;
    }

    /**
     * @notice Adds or updates user information
     * @param _statusContactCode New status contact code
     * @param _location New location
     * @param _username New status username
     * @return Signing user address
     */
    function addOrUpdateUser(
        bytes calldata _statusContactCode,
        string calldata _location,
        string calldata _username
    ) external {
        _addOrUpdateUser(msg.sender, _statusContactCode, _location, _username);
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
        bytes memory _statusContactCode,
        string memory _location,
        string memory _currency,
        string memory _username,
        PaymentMethods[] memory _paymentMethods,
        int8 _margin,
        address payable _arbitrator
    ) public {
        require(sellingLicenses.isLicenseOwner(msg.sender), "Not a license owner");
        require(arbitrationLicenses.isPermitted(msg.sender, _arbitrator), "Arbitrator does not allow this transaction");

        require(_margin <= 100, "Margin too high");
        require(_margin >= -100, "Margin too low");
        require(msg.sender != _arbitrator, "Cannot arbitrate own offers");

        _addOrUpdateUser(msg.sender, _statusContactCode, _location, _username);

        Offer memory newOffer = Offer(_margin, _paymentMethods, _asset, _currency, msg.sender, _arbitrator, false);

        uint256 offerId = offers.push(newOffer) - 1;
        offerWhitelist[msg.sender][offerId] = true;
        addressToOffers[msg.sender].push(offerId);

        emit OfferAdded(msg.sender, offerId, _asset, _statusContactCode, _location, _currency, _username, _paymentMethods, _margin);
    }

    /**
     * @notice Update the user information
     * @param _statusContactCode Status contact code
     * @param _location Location on earth
     * @param _username Username of the user
     */
    function updateUser(bytes calldata _statusContactCode, string calldata _location, string calldata _username) external {
        require(userWhitelist[msg.sender], "User does not exist");

        User storage tmpUser = users[addressToUser[msg.sender]];
        tmpUser.statusContactCode = _statusContactCode;
        tmpUser.location = _location;
        tmpUser.username = _username;

        emit UserUpdated(msg.sender, _statusContactCode, _location, _username);
    }

    /**
     * @notice Remove user offer
     * @dev Removed offers are marked as deleted instead of being deleted
     * @param _offerId Id of the offer to remove
     */
    function removeOffer(uint256 _offerId) external {
        require(userWhitelist[msg.sender], "User does not exist");
        require(offerWhitelist[msg.sender][_offerId], "Offer does not exist");

        offers[_offerId].deleted = true;
        offerWhitelist[msg.sender][_offerId] = false;
        emit OfferRemoved(msg.sender, _offerId);
    }

    /**
     * @notice Get the offer by Id
     * @dev normally we'd access the offers array, but it would not return the payment methods
     * @param _id Offer id
     * @return Offer data (see Offer struct)
     */
    function offer(uint256 _id) external view returns (
        address asset,
        string memory currency,
        int8 margin,
        PaymentMethods[] memory paymentMethods,
        address payable owner,
        address payable arbitrator,
        bool deleted
    ) {
        return (
            offers[_id].asset,
            offers[_id].currency,
            offers[_id].margin,
            offers[_id].paymentMethods,
            offers[_id].owner,
            offers[_id].arbitrator,
            offers[_id].deleted
        );
    }

    /**
     * @notice Get the offer's owner by Id
     * @dev Helper function
     * @param _id Offer id
     * @return Seller address
     */
    function getOfferOwner(uint256 _id) external view returns (address payable) {
        return (offers[_id].owner);
    }

    /**
     * @notice Get the offer's asset by Id
     * @dev Helper function
     * @param _id Offer id
     * @return Token address used in the offer
     */
    function getAsset(uint256 _id) external view returns (address) {
        return (offers[_id].asset);
    }

    /**
     * @notice Get the offer's arbitrator by Id
     * @dev Helper function
     * @param _id Offer id
     * @return Arbitrator address
     */
    function getArbitrator(uint256 _id) external view returns (address payable) {
        return (offers[_id].arbitrator);
    }

    /**
     * @notice Get the size of the users
     * @return Number of users stored in the contract
     */
    function usersSize() external view returns (uint256) {
        return users.length;
    }

    /**
     * @notice Get the size of the offers
     * @return Number of offers stored in the contract
     */
    function offersSize() external view returns (uint256) {
        return offers.length;
    }

    /**
     * @notice Get all the offer ids of the address in params
     * @param _address Address of the offers
     * @return Array of offer ids for a specific address
     */
    function getOfferIds(address _address) external view returns (uint256[] memory) {
        return addressToOffers[_address];
    }
}
