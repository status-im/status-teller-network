pragma solidity ^0.5.0;

import "./Ownable.sol";

contract Pausable is Ownable {

    event Paused();
    event Unpaused();

    bool public paused;

    constructor () internal {
        paused = false;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract must be unpaused");
        _;
    }

    modifier whenPaused() {
        require(paused, "Contract must be paused");
        _;
    }

    function pause() public onlyOwner whenNotPaused {
        paused = true;
        emit Paused();
    }


    function unpause() public onlyOwner whenPaused {
        paused = false;
        emit Unpaused();
    }
}