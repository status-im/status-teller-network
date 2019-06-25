/* solium-disable security/no-low-level-calls */

pragma solidity >=0.5.0 <0.6.0;

import "./Escrow.sol";
import "../factory/Factory.sol";

/**
 * @title Escrow Factory
 */
contract EscrowManagement is Factory {

    mapping(address => bool) public escrowInstances;

    mapping(address => uint256) public rating;

    event InstanceCreated(address instance, uint indexed offerId, address indexed buyer, address indexed seller);
    event Rating(address indexed escrow, uint indexed offerId, address seller, address indexed buyer, uint rating);

    /**
     * @notice Create a new escrow instance
     * @param _offerId Offer
     * @param _tradeAmount Amount buyer is willing to trade
     * @param _tradeType Indicates if the amount is in crypto or fiat
     * @param _assetPrice Indicates the price of the asset in the FIAT of choice
     * @param _statusContactCode The address of the status contact code
     * @param _location The location on earth
     * @param _username The username of the user
     * @param _signature buyer's signature
     */
    function create (
        uint _offerId,
        uint _tradeAmount,
        uint8 _tradeType,
        uint _assetPrice,
        bytes memory _statusContactCode,
        string memory _location,
        string memory _username,
        uint _nonce,
        bytes memory _signature
    ) public whenNotPaused returns (address instance) {
        instance = getInstance();

        address buyer;
        address seller;

        (buyer, seller) = Escrow(instance).create(
            _offerId,
            _tradeAmount,
            _tradeType,
            _assetPrice,
            _statusContactCode,
            _location,
            _username,
            _nonce,
            _signature
        );

        address aInstance = address(instance);

        escrowInstances[aInstance] = true;

        emit InstanceCreated(aInstance, _offerId, buyer, seller);
    }

    /**
     * @notice Rate an escrow
     * @param _seller Escrow seller
     * @param _buyer Escrow buyer
     * @param _rate Rating
     */
    function rate(uint _offerId, address _seller, address _buyer, uint _rate) external {
        require(escrowInstances[msg.sender], "Not an escrow");
        rating[msg.sender] = _rate;
        emit Rating(msg.sender, _offerId, _seller, _buyer, _rate);
    }

}