pragma solidity 0.5.7;

interface Arbitrable {
    function setArbitrationResult(uint _escrowId, bool _releaseFunds) external;
}