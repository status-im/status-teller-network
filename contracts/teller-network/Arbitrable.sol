/* solium-disable security/no-block-members */
pragma solidity >=0.5.0 <0.6.0;

import "./ArbitrationLicense.sol";

/**
 * Arbitrable
 * @dev Utils for management of disputes
 */
contract Arbitrable {

    enum ArbitrationResult {UNSOLVED, BUYER, SELLER}

    ArbitrationLicense public arbitratorLicenses;

    mapping(uint => ArbitrationCase) public arbitrationCases;

    struct ArbitrationCase {
        bool open;
        address openBy;
        address arbitrator;
        ArbitrationResult result;
        string motive;
    }

    event ArbitratorChanged(address arbitrator);
    event ArbitrationCanceled(uint escrowId);
    event ArbitrationRequired(uint escrowId);
    event ArbitrationResolved(uint escrowId, ArbitrationResult result, address arbitrator);

    /**
     * @param _arbitratorLicenses Address of the Arbitrator Licenses contract
     */
    constructor(address _arbitratorLicenses) public {
        arbitratorLicenses = ArbitrationLicense(_arbitratorLicenses);
    }

    /**
     * @param _escrowId Id of the escrow with an open dispute
     * @param _releaseFunds Release funds to the buyer
     * @param _arbitrator Address of the arbitrator solving the dispute
     * @dev Abstract contract used to perform actions after a dispute has been settled
     */
    function _solveDispute(uint _escrowId, bool _releaseFunds, address _arbitrator) internal;

    /**
     * @notice Get arbitrator of an escrow
     * @return address Arbitrator address
     */
    function getArbitrator(uint _escrowId) public view returns(address);

    /**
     * @notice Determine if a dispute exists/existed for an escrow
     * @param _escrowId Escrow to verify
     * @return bool result
     */
    function isDisputed(uint _escrowId) public view returns (bool) {
        return arbitrationCases[_escrowId].open || arbitrationCases[_escrowId].result != ArbitrationResult.UNSOLVED;
    }

    /**
     * @notice Cancel arbitration
     * @param _escrowId Escrow to cancel
     */
    function cancelArbitration(uint _escrowId) external {
        require(arbitrationCases[_escrowId].openBy == msg.sender, "Arbitration can only be canceled by the opener");
        require(arbitrationCases[_escrowId].result == ArbitrationResult.UNSOLVED && arbitrationCases[_escrowId].open,
                "Arbitration already solved or not open");

        delete arbitrationCases[_escrowId];

        emit ArbitrationCanceled(_escrowId);
    }

    function _openDispute(uint _escrowId, address _openBy, string memory motive) internal {
        require(arbitrationCases[_escrowId].result == ArbitrationResult.UNSOLVED && !arbitrationCases[_escrowId].open,
                "Arbitration already solved or has been opened before");

        arbitrationCases[_escrowId] = ArbitrationCase({
            open: true,
            openBy: _openBy,
            arbitrator: address(0),
            result: ArbitrationResult.UNSOLVED,
            motive: motive
        });

        emit ArbitrationRequired(_escrowId);
    }

    /**
     * @notice Set arbitration result in favour of the buyer or seller and transfer funds accordingly
     * @param _escrowId Id of the escrow
     * @param _result Result of the arbitration
     */
    function setArbitrationResult(uint _escrowId, ArbitrationResult _result) external {
        require(arbitrationCases[_escrowId].open && arbitrationCases[_escrowId].result == ArbitrationResult.UNSOLVED,
                "Case must be open and unsolved");
        require(_result != ArbitrationResult.UNSOLVED, "Arbitration does not have result");
        require(arbitratorLicenses.isLicenseOwner(msg.sender), "Only arbitrators can invoke this function");
        require(getArbitrator(_escrowId) == msg.sender, "Invalid escrow arbitrator");

        arbitrationCases[_escrowId].open = false;
        arbitrationCases[_escrowId].result = _result;
        arbitrationCases[_escrowId].arbitrator = msg.sender;

        // TODO: incentive mechanism for opening arbitration process
        // if(arbitrationCases[_escrowId].openBy != trx.seller || arbitrationCases[_escrowId].openBy != trx.buyer){
            // Consider deducting a fee as reward for whoever opened the arbitration process.
        // }

        emit ArbitrationResolved(_escrowId, _result, msg.sender);

        if(_result == ArbitrationResult.BUYER){
            _solveDispute(_escrowId, true, msg.sender);
        } else {
            _solveDispute(_escrowId, false, msg.sender);
        }
    }
}
