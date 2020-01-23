pragma solidity ^0.5.7;

/**
 * @title Medianizer Mock Contract
 */
contract Medianizer {
    function peek() public view returns (bytes32, bool) {
        return (bytes32(0x000000000000000000000000000000000000000000000008c233113a8becc000), true);
    }
    function read() public view returns (bytes32) {
        return bytes32(0x000000000000000000000000000000000000000000000008c233113a8becc000);
    }
}
