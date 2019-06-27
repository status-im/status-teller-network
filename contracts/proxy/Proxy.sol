pragma solidity >=0.5.0 <0.6.0;

import "ProxyData.sol";

contract Proxy is ProxyData {

    constructor(address _impl) public {
        _implementation = _impl;
    }


     function implementation() public view returns (address) {
        return _implementation;
    }

    function proxyType() public pure returns (uint256) {
        return 2;
    }

    function () payable external {
        address _impl = _implementation;
        assert(_impl != address(0));

        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize)
            let result := delegatecall(gas, _impl, ptr, calldatasize, 0, 0)
            let size := returndatasize
            returndatacopy(ptr, 0, size)

            switch result
            case 0 { revert(ptr, size) }
            default { return(ptr, size) }
        }
  }

}