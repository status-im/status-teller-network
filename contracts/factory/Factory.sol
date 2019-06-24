/* solium-disable security/no-low-level-calls */

pragma solidity ^0.5.8;

import "../common/Ownable.sol";
import "../proxy/Proxy.sol";
import "../common/Pausable.sol";

/**
 * @title Escrow Factory
 */
contract Factory is Ownable, Pausable {
    address public template;
    bytes public initParameters;

    event TemplateChanged(address newTemplate, bytes newInitParameters);

    /**
     * @notice Set New Factory Template
     * @param _template Address to be used for Escrow
     * @param _initParameters ABI encoded initialization function + parameters (use MyContract.methods.initFunction(parameters).encodeABI())
     */
    function setTemplate(address _template, bytes memory _initParameters) public onlyOwner {
        template = _template;
        initParameters = _initParameters;

        emit TemplateChanged(_template, _initParameters);
    }

    /**
     * @dev Obtain an initialized instance
     * @return new escrow address
     */
    function getInstance() internal returns(address instance) {
        instance = address(new Proxy(address(template)));
        instance.call(initParameters);
    }
}