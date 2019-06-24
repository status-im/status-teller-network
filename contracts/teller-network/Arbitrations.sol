/* solium-disable security/no-block-members */
pragma solidity >=0.5.0 <0.6.0;

import "./License.sol";
import "../common/Ownable.sol";
import "./Arbitrable.sol";

/**
 * Arbitrations
 * @dev Utils for management of disputes
 */
contract Arbitrations is Ownable {

    enum ArbitrationResult {UNSOLVED, BUYER, SELLER}

    License public arbitratorLicenses;

    mapping(address => ArbitrationCase) public arbitrationCases;

    struct ArbitrationCase {
        bool open;
        address openBy;
        address arbitrator;
        ArbitrationResult result;
        string motive;
    }

    event ArbitrationCanceled(address item);
    event ArbitrationRequired(address item, address arbitrator);
    event ArbitrationResolved(address item, ArbitrationResult result, address arbitrator);

    /**
     * @param _arbitratorLicenses Address of the Arbitrator Licenses contract
     */
    constructor(address _arbitratorLicenses) public {
        arbitratorLicenses = License(_arbitratorLicenses);
    }

    /**
     * @notice Determine if a dispute exists/existed for an item
     * @return bool result
     */
    function isDisputed(address _item) public view returns (bool) {
        return arbitrationCases[_item].open || arbitrationCases[_item].result != ArbitrationResult.UNSOLVED;
    }

    /**
     * @notice cancel arbitration
     * @param _item Disputed item to cancel
     */
    function cancelArbitration(address _item) public {
        require(arbitrationCases[_item].openBy == msg.sender, "Arbitration can only be canceled by the opener");
        require(arbitrationCases[_item].result == ArbitrationResult.UNSOLVED && arbitrationCases[_item].open,
                "Arbitration already solved or not open");

        delete arbitrationCases[_item];

        emit ArbitrationCanceled(_item);
    }

    function openCase(address _openBy, string memory motive) public {
        require(!arbitrationCases[msg.sender].open, "Arbitration already open");
        require(arbitrationCases[msg.sender].result == ArbitrationResult.UNSOLVED, "Arbitration already solved");

        address arbitrator = Arbitrable(msg.sender).getArbitrator();

        arbitrationCases[msg.sender] = ArbitrationCase({
            open: true,
            openBy: _openBy,
            arbitrator: arbitrator,
            result: ArbitrationResult.UNSOLVED,
            motive: motive
        });

        emit ArbitrationRequired(msg.sender, arbitrator);
    }

    /**
     * @notice Set arbitration result in favour of the buyer or seller and transfer funds accordingly
     * @param _item Id of the escrow
     * @param _result Result of the arbitration
     */
    function setArbitrationResult(address _item, ArbitrationResult _result) public {
        require(arbitrationCases[_item].open && arbitrationCases[_item].result == ArbitrationResult.UNSOLVED,
                "Case must be open and unsolved");
        require(_result != ArbitrationResult.UNSOLVED, "Arbitration does not have result");
        require(arbitratorLicenses.isLicenseOwner(msg.sender), "Only arbitrators can invoke this function");
        require(arbitrationCases[_item].arbitrator == msg.sender, "Invalid arbitrator");

        arbitrationCases[_item].open = false;
        arbitrationCases[_item].result = _result;
        arbitrationCases[_item].arbitrator = msg.sender;

        // TODO: incentive mechanism for opening arbitration process
        // if(arbitrationCases[_escrowId].openBy != trx.seller || arbitrationCases[_escrowId].openBy != trx.buyer){
            // Consider deducting a fee as reward for whoever opened the arbitration process.
        // }

        emit ArbitrationResolved(_item, _result, msg.sender);

        if(_result == ArbitrationResult.BUYER){
            Arbitrable(_item).setArbitrationResult(true, msg.sender);
        } else {
            Arbitrable(_item).setArbitrationResult(false, msg.sender);
        }
    }
}