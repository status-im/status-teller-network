pragma solidity >=0.5.0 <0.6.0;

import "./OfferStore.sol";
import "../common/USDStakable.sol";

/**
* @title OfferStore
* @dev Offers registry
*/
contract OfferStoreV2 is OfferStore, USDStakable {
    bool internal _initializedV2 = false;
    uint public maxOffers = 10;
    mapping(address => uint) public offerCnt;

    /**
     * @param _userStore User store contract address
     * @param _sellingLicenses Sellers licenses contract address
     * @param _arbitrationLicenses Arbitrators licenses contract address
     * @param _burnAddress Address to send slashed offer funds
     * @param _medianizer DAI medianizer to obtain USD price
     */
    constructor(address _userStore, address _sellingLicenses, address _arbitrationLicenses, address payable _burnAddress, address _medianizer) public
        OfferStore(_userStore, _sellingLicenses, _arbitrationLicenses, _burnAddress)
        USDStakable(_burnAddress, _medianizer)
    {
        initV2(_medianizer);
    }

    /**
     * @dev Initialize contract (used with proxy). Can only be called once
     */
    function initV2(
        address _medianizer
    ) public {
        assert(_initializedV2 == false);
        _initializedV2 = true;
        medianizer = Medianizer(_medianizer);
        maxOffers = 10;
        basePrice = 1 ether;
    }

    event MaxOffersChanged(address sender, uint oldMax, uint newMax);

    /**
     * @dev Change max offers allowed per seller
     * @param _newMax New max offers amount
     */
    function setMaxOffers(
        uint _newMax
    ) public onlyOwner {
        emit MaxOffersChanged(msg.sender, maxOffers, _newMax);
        maxOffers = _newMax;
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
        require(offerCnt[msg.sender] < maxOffers, "Exceeds the max number of offers");
        require(arbitrationLicenses.isAllowed(msg.sender, _arbitrator), "Arbitrator does not allow this transaction");

        require(_limitL <= _limitU, "Invalid limits");
        require(msg.sender != _arbitrator, "Cannot arbitrate own offers");

        userStore.addOrUpdateUser(
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
        offerCnt[msg.sender]++;

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

        if(offerCnt[msg.sender] - 1 > offerCnt[msg.sender]){
            offerCnt[msg.sender] = 0;
        } else {
            offerCnt[msg.sender]--;
        }

        _unstake(_offerId);
    }
}
