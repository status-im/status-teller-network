pragma solidity >=0.5.0 <0.6.0;

import "./License.sol";
import "./ArbitrationLicense.sol";
import "../common/MessageSigned.sol";
import "../common/SecuredFunctions.sol";
import "../common/Stakable.sol";
import "../proxy/Proxiable.sol";


/**
* @title MetadataStore
* @dev User and offers registry
*/
contract MetadataStore is Stakable, MessageSigned, SecuredFunctions, Proxiable {

    struct User {
        string contactData;
        string location;
        string username;
    }

    struct Offer {
        int16 margin;
        uint[] paymentMethods;
        uint limitL;
        uint limitU;
        address asset;
        string currency;
        address payable owner;
        address payable arbitrator;
        bool deleted;
    }

    License public sellingLicenses;
    ArbitrationLicense public arbitrationLicenses;

    mapping(address => User) public users;
    mapping(address => uint) public user_nonce;

    Offer[] public offers;
    mapping(address => uint256[]) public addressToOffers;
    mapping(address => mapping (uint256 => bool)) public offerWhitelist;

    event OfferAdded(
        address owner,
        uint256 offerId,
        address asset,
        string location,
        string currency,
        string username,
        uint[] paymentMethods,
        uint limitL,
        uint limitU,
        int16 margin
    );

    event OfferRemoved(address owner, uint256 offerId);

    /**
     * @param _sellingLicenses Sellers licenses contract address
     * @param _arbitrationLicenses Arbitrators licenses contract address
     * @param _burnAddress Address to send slashed offer funds
     */
    constructor(address _sellingLicenses, address _arbitrationLicenses, address payable _burnAddress) public
        Stakable(_burnAddress)
    {
        init(_sellingLicenses, _arbitrationLicenses);
    }

    /**
     * @dev Initialize contract (used with proxy). Can only be called once
     * @param _sellingLicenses Sellers licenses contract address
     * @param _arbitrationLicenses Arbitrators licenses contract address
     */
    function init(
        address _sellingLicenses,
        address _arbitrationLicenses
    ) public {
        assert(_initialized == false);

        _initialized = true;

        sellingLicenses = License(_sellingLicenses);
        arbitrationLicenses = ArbitrationLicense(_arbitrationLicenses);

        basePrice = 0.01 ether;


        _setOwner(msg.sender);
    }

    function updateCode(address newCode) public onlyOwner {
        updateCodeAddress(newCode);
    }

    event LicensesChanged(address sender, address oldSellingLicenses, address newSellingLicenses, address oldArbitrationLicenses, address newArbitrationLicenses);

    /**
     * @dev Initialize contract (used with proxy). Can only be called once
     * @param _sellingLicenses Sellers licenses contract address
     * @param _arbitrationLicenses Arbitrators licenses contract address
     */
    function setLicenses(
        address _sellingLicenses,
        address _arbitrationLicenses
    ) public onlyOwner {
        emit LicensesChanged(msg.sender, address(sellingLicenses), address(_sellingLicenses), address(arbitrationLicenses), (_arbitrationLicenses));

        sellingLicenses = License(_sellingLicenses);
        arbitrationLicenses = ArbitrationLicense(_arbitrationLicenses);
    }

    /**
     * @dev Get datahash to be signed
     * @param _username Username
     * @param _contactData Contact Data   ContactType:UserId
     * @param _nonce Nonce value (obtained from user_nonce)
     * @return bytes32 to sign
     */
    function _dataHash(string memory _username, string memory _contactData, uint _nonce) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this), _username, _contactData, _nonce));
    }

    /**
     * @notice Get datahash to be signed
     * @param _username Username
     * @param _contactData Contact Data   ContactType:UserId
     * @return bytes32 to sign
     */
    function getDataHash(string calldata _username, string calldata _contactData) external view returns (bytes32) {
        return _dataHash(_username, _contactData, user_nonce[msg.sender]);
    }

    /**
     * @dev Get signer address from signature. This uses the signature parameters to validate the signature
     * @param _username Status username
     * @param _contactData Contact Data   ContactType:UserId
     * @param _nonce User nonce
     * @param _signature Signature obtained from the previous parameters
     * @return Signing user address
     */
    function _getSigner(
        string memory _username,
        string memory _contactData,
        uint _nonce,
        bytes memory _signature
    ) internal view returns(address) {
        bytes32 signHash = _getSignHash(_dataHash(_username, _contactData, _nonce));
        return _recoverAddress(signHash, _signature);
    }

    /**
     * @notice Get signer address from signature
     * @param _username Status username
     * @param _contactData Contact Data   ContactType:UserId
     * @param _nonce User nonce
     * @param _signature Signature obtained from the previous parameters
     * @return Signing user address
     */
    function getMessageSigner(
        string calldata _username,
        string calldata _contactData,
        uint _nonce,
        bytes calldata _signature
    ) external view returns(address) {
        return _getSigner(_username, _contactData, _nonce, _signature);
    }

    /**
     * @dev Adds or updates user information
     * @param _user User address to update
     * @param _contactData Contact Data   ContactType:UserId
     * @param _location New location
     * @param _username New status username
     */
    function _addOrUpdateUser(
        address _user,
        string memory _contactData,
        string memory _location,
        string memory _username
    ) internal {
        User storage u = users[_user];
        u.contactData = _contactData;
        u.location = _location;
        u.username = _username;
    }

    /**
     * @notice Adds or updates user information via signature
     * @param _signature Signature
     * @param _contactData Contact Data   ContactType:UserId
     * @param _location New location
     * @param _username New status username
     * @return Signing user address
     */
    function addOrUpdateUser(
        bytes calldata _signature,
        string calldata _contactData,
        string calldata _location,
        string calldata _username,
        uint _nonce
    ) external returns(address payable _user) {
        _user = address(uint160(_getSigner(_username, _contactData, _nonce, _signature)));

        require(_nonce == user_nonce[_user], "Invalid nonce");

        user_nonce[_user]++;
        _addOrUpdateUser(_user, _contactData, _location, _username);

        return _user;
    }

    /**
     * @notice Adds or updates user information
     * @param _contactData Contact Data   ContactType:UserId
     * @param _location New location
     * @param _username New status username
     * @return Signing user address
     */
    function addOrUpdateUser(
        string calldata _contactData,
        string calldata _location,
        string calldata _username
    ) external {
        _addOrUpdateUser(msg.sender, _contactData, _location, _username);
    }

    /**
     * @notice Adds or updates user information
     * @dev can only be called by the escrow contract
     * @param _sender Address that sets the user info
     * @param _contactData Contact Data   ContactType:UserId
     * @param _location New location
     * @param _username New status username
     * @return Signing user address
     */
    function addOrUpdateUser(
        address _sender,
        string calldata _contactData,
        string calldata _location,
        string calldata _username
    ) external onlyAllowedContracts {
        _addOrUpdateUser(_sender, _contactData, _location, _username);
    }

    /**
    * @dev Add a new offer with a new user if needed to the list
    * @param _asset The address of the erc20 to exchange, pass 0x0 for Eth
    * @param _contactData Contact Data   ContactType:UserId
    * @param _location The location on earth
    * @param _currency The currency the user want to receive (USD, EUR...)
    * @param _username The username of the user
    * @param _paymentMethods The list of the payment methods the user accept
    * @param _limitL Lower limit accepted
    * @param _limitU Upper limit accepted
    * @param _margin The margin for the user
    * @param _arbitrator The arbitrator used by the offer
    */
    function addOffer(
        address _asset,
        string memory _contactData,
        string memory _location,
        string memory _currency,
        string memory _username,
        uint[] memory _paymentMethods,
        uint _limitL,
        uint _limitU,
        int16 _margin,
        address payable _arbitrator
    ) public payable {
        //require(sellingLicenses.isLicenseOwner(msg.sender), "Not a license owner");
        // @TODO: limit number of offers if the sender is unlicensed?

        require(arbitrationLicenses.isAllowed(msg.sender, _arbitrator), "Arbitrator does not allow this transaction");

        require(_limitL <= _limitU, "Invalid limits");
        require(msg.sender != _arbitrator, "Cannot arbitrate own offers");

        _addOrUpdateUser(
            msg.sender,
            _contactData,
            _location,
            _username
        );

        Offer memory newOffer = Offer(
            _margin,
            _paymentMethods,
            _limitL,
            _limitU,
            _asset,
            _currency,
            msg.sender,
            _arbitrator,
            false
        );

        uint256 offerId = offers.push(newOffer) - 1;
        offerWhitelist[msg.sender][offerId] = true;
        addressToOffers[msg.sender].push(offerId);

        emit OfferAdded(
            msg.sender,
            offerId,
            _asset,
            _location,
            _currency,
            _username,
            _paymentMethods,
            _limitL,
            _limitU,
            _margin);

        _stake(offerId, msg.sender, _asset);
    }

    /**
     * @notice Remove user offer
     * @dev Removed offers are marked as deleted instead of being deleted
     * @param _offerId Id of the offer to remove
     */
    function removeOffer(uint256 _offerId) external {
        require(offerWhitelist[msg.sender][_offerId], "Offer does not exist");

        offers[_offerId].deleted = true;
        offerWhitelist[msg.sender][_offerId] = false;
        emit OfferRemoved(msg.sender, _offerId);

        _unstake(_offerId);
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
        int16 margin,
        uint[] memory paymentMethods,
        uint limitL,
        uint limitH,
        address payable owner,
        address payable arbitrator,
        bool deleted
    ) {
        Offer memory theOffer = offers[_id];

        // In case arbitrator rejects the seller
        address payable offerArbitrator = theOffer.arbitrator;
        if(!arbitrationLicenses.isAllowed(theOffer.owner, offerArbitrator)){
            offerArbitrator = address(0);
        }

        return (
            theOffer.asset,
            theOffer.currency,
            theOffer.margin,
            theOffer.paymentMethods,
            theOffer.limitL,
            theOffer.limitU,
            theOffer.owner,
            offerArbitrator,
            theOffer.deleted
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

    /**
     * @dev Slash offer stake. If the sender is not the escrow contract, nothing will happen
     * @param _offerId Offer Id to slash
     */
    function slashStake(uint _offerId) external onlyAllowedContracts {
        _slash(_offerId);
    }

    /**
     * @dev Refunds a stake. Can be called automatically after an escrow is released
     * @param _offerId Offer Id to slash
     */
    function refundStake(uint _offerId) external onlyAllowedContracts {
        _refundStake(_offerId);
    }
}
