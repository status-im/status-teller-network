/* solium-disable security/no-low-level-calls */

pragma solidity >=0.5.0 <0.6.0;

import "./Escrow.sol";
import "../factory/Factory.sol";

/**
 * @title Escrow Factory
 */
contract EscrowFactory is Factory {

    event InstanceCreated(address instance, address buyer);

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
instance = address(new Proxy(address(template)));
        instance.call(initParameters);
        address buyer = Escrow(instance).create(
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

        emit InstanceCreated(address(instance), buyer);
    }
}