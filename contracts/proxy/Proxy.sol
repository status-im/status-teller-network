pragma solidity >=0.5.0 <0.6.0;

import "ProxyData.sol";

contract Proxy is ProxyData {

    constructor(address _proxied) public {
        proxied = _proxied;
    }

    function () external payable {
        address addr = proxied;
        assembly {
            let freememstart := mload(0x40)
            calldatacopy(freememstart, 0, calldatasize())
            let success := delegatecall(not(0), addr, freememstart, calldatasize(), freememstart, 32)
            switch success
            case 0 { revert(freememstart, 32) }
            default { return(freememstart, 32) }
        }
    }

}