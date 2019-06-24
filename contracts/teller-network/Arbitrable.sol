/* solium-disable security/no-block-members */
pragma solidity >=0.5.0 <0.6.0;

interface Arbitrable {

    function setArbitrationResult(bool _releaseFunds, address _arbitrator) external;

    function getArbitrator() external view returns(address);

}