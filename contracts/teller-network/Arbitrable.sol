pragma solidity ^0.5.8;

interface Arbitrable {
    function setArbitrationResult(uint _escrowId, bool _releaseFunds, address _arbitrator) external;
    function getArbitrator(uint _escrowId) external view returns(address);
}