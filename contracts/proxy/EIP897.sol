pragma solidity >=0.5.0 <0.6.0;

interface EIP897 {
    function proxyType() external pure returns (uint256 proxyTypeId);
    function implementation() external view returns (address codeAddr);
}