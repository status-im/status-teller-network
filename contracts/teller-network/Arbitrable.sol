/* solium-disable security/no-block-members */

pragma solidity ^0.5.8;

import "./License.sol";

contract Arbitrable {
    mapping(uint => ArbitrationCase) public arbitrationCases;

    struct ArbitrationCase {
        bool open;
        address openBy;
        address arbitrator;
        ArbitrationResult result;
        string motive;
    }

    event ArbitratorChanged(address arbitrator);
    event ArbitrationCanceled(uint escrowId, uint date);
    event ArbitrationRequired(uint escrowId, uint date);
    event ArbitrationResolved(uint escrowId, ArbitrationResult result, address arbitrator, uint date);

    enum ArbitrationResult {UNSOLVED, BUYER, SELLER}

    License public arbitratorLicenses;

    constructor(address _arbitratorLicenses) public {
        arbitratorLicenses = License(_arbitratorLicenses);
    }


    // Abstract functions
    function solveDispute(uint _escrowId, bool _releaseFunds, address _arbitrator) internal;
    function getArbitrator(uint _escrowId) public view returns(address);


    /**
     * @notice arbitration exists
     * @param _escrowId Escrow to verify
     * @return bool result
     */
    function isDisputed(uint _escrowId) public view returns (bool) {
        return arbitrationCases[_escrowId].open || arbitrationCases[_escrowId].result != ArbitrationResult.UNSOLVED;
    }


    /**
     * @notice cancel arbitration
     * @param _escrowId Escrow to cancel
     */
    function cancelArbitration(uint _escrowId) public {
        require(arbitrationCases[_escrowId].openBy == msg.sender, "Arbitration can only be canceled by the opener");
        require(arbitrationCases[_escrowId].result == ArbitrationResult.UNSOLVED && arbitrationCases[_escrowId].open,
                "Arbitration already solved or not open");
        
        delete arbitrationCases[_escrowId];

        emit ArbitrationCanceled(_escrowId, block.timestamp);
    }


    function openDispute(uint _escrowId, address _openBy, string memory motive) internal {
        require(!arbitrationCases[_escrowId].open, "Arbitration already open");
        require(arbitrationCases[_escrowId].result == ArbitrationResult.UNSOLVED, "Arbitration already solved");

        arbitrationCases[_escrowId] = ArbitrationCase({
            open: true,
            openBy: _openBy,
            arbitrator: address(0),
            result: ArbitrationResult.UNSOLVED,
            motive: motive
        });

        emit ArbitrationRequired(_escrowId, block.timestamp);
    }


    /**
     * @notice Set arbitration result in favour of the buyer or seller and transfer funds accordingly
     * @param _escrowId Id of the escrow
     * @param _result Result of the arbitration
     */
    function setArbitrationResult(uint _escrowId, ArbitrationResult _result) public {
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

        emit ArbitrationResolved(_escrowId, _result, msg.sender, block.timestamp);

        if(_result == ArbitrationResult.BUYER){
            solveDispute(_escrowId, true, msg.sender);
        } else {
            solveDispute(_escrowId, false, msg.sender);
        }
    }

}
