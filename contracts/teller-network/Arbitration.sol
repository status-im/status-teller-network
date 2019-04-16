pragma solidity ^0.5.7;

import "../common/Ownable.sol";
import "./Arbitrable.sol";


contract Arbitration is Ownable {

    mapping(uint => ArbitrationCase) public arbitrationCases;

    struct ArbitrationCase {
        bool open;
        address openBy;
        address arbitrator;
        ArbitrationResult result;
    }

    event ArbitratorChanged(address arbitrator);
    event ArbitrationRequired(uint escrowId, uint date);
    event ArbitrationResolved(uint escrowId, ArbitrationResult result, address arbitrator, uint date);

    enum ArbitrationResult {UNSOLVED, BUYER, SELLER}

    address public arbitrator;
    
    Arbitrable public escrow;

    modifier onlyArbitrator {
        require(isArbitrator(msg.sender), "Only arbitrators can invoke this function");
        _;
    }

    constructor(address _arbitrator) public {
        arbitrator = _arbitrator;
    }

    function setEscrowAddress(address _escrow) public onlyOwner {
        escrow = Arbitrable(_escrow);
    }

    /**
     * @notice Get Arbitrator
     * @return arbitrator address
     */
    function getArbitrator() public view returns(address){
        return arbitrator;
    }
    

    /**
     * @notice Determine if address is arbitrator
     * @param _addr Address to be verified
     * @return result
     */
    function isArbitrator(address _addr) public view returns(bool){
        return arbitrator == _addr;
    }

    /**
     * @notice Set address as arbitrator
     * @param _addr New arbitrator address
     * @dev Can only be called by the owner of the contract
     */
    function setArbitrator(address _addr) public onlyOwner {
        arbitrator = _addr;
        emit ArbitratorChanged(_addr);
    }


    /**
     * @notice arbitration exists
     * @param _escrowId Escrow to verify
     * @return bool result
     */
    function exists(uint _escrowId) public view returns (bool) {
        return arbitrationCases[_escrowId].open || arbitrationCases[_escrowId].result != ArbitrationResult.UNSOLVED;
    }


    function openCase(uint _escrowId, address _openBy) public {
        assert(msg.sender == address(escrow)); // Only the escrow address can open cases

        arbitrationCases[_escrowId] = ArbitrationCase({
            open: true,
            openBy: _openBy,
            arbitrator: address(0),
            result: ArbitrationResult.UNSOLVED
        });

        emit ArbitrationRequired(_escrowId, block.timestamp);
    }


    /**
     * @notice Set arbitration result in favour of the buyer or seller and transfer funds accordingly
     * @param _escrowId Id of the escrow
     * @param _result Result of the arbitration
     */
    function setArbitrationResult(uint _escrowId, ArbitrationResult _result) public onlyArbitrator {
        require(arbitrationCases[_escrowId].open && arbitrationCases[_escrowId].result == ArbitrationResult.UNSOLVED, "Case must be open and unsolved");
        require(_result != ArbitrationResult.UNSOLVED, "Arbitration does not have result");

        arbitrationCases[_escrowId].open = false;
        arbitrationCases[_escrowId].result = _result;
        arbitrationCases[_escrowId].arbitrator = msg.sender;

        // TODO: incentive mechanism for opening arbitration process
        // if(arbitrationCases[_escrowId].openBy != trx.seller || arbitrationCases[_escrowId].openBy != trx.buyer){
            // Consider deducting a fee as reward for whoever opened the arbitration process.
        // }

        emit ArbitrationResolved(_escrowId, _result, msg.sender, block.timestamp);

        if(_result == ArbitrationResult.BUYER){
            escrow.setArbitrationResult(_escrowId, true);
        } else {
            escrow.setArbitrationResult(_escrowId, false);
        }
    }

}