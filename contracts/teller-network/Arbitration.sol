pragma solidity ^0.5.7;

import "../common/Ownable.sol";
import "./Arbitrable.sol";
import "./License.sol";


contract Arbitration is Ownable, License {

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
    
    Arbitrable public escrow;

    modifier onlyArbitrator {
        require(isArbitrator(msg.sender), "Only arbitrators can invoke this function");
        _;
    }

    constructor(address payable _tokenAddress, uint256 _price) 
        License(_tokenAddress, _price)
        public {
    }

    function setEscrowAddress(address _escrow) public onlyOwner {
        escrow = Arbitrable(_escrow);
    }


    /**
     * @notice Determine if address is arbitrator
     * @param _addr Address to be verified
     * @return result
     */
    function isArbitrator(address _addr) public view returns(bool){
        return isLicenseOwner(_addr);
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
            escrow.setArbitrationResult(_escrowId, true, msg.sender);
        } else {
            escrow.setArbitrationResult(_escrowId, false, msg.sender);
        }
    }

}