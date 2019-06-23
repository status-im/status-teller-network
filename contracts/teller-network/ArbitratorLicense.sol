pragma solidity ^0.5.8;

import "./License.sol";

contract ArbitratorLicense is License{

	struct ArbitratorLicenseDetails {
        // LicenseDetails licenseDetails;
        uint id; 
        bool acceptAny; // accept any seller
        address[] accepted; // addresses of accepted sellers
    }

    mapping(address => ArbitratorLicenseDetails) arbitratorlicenseDetails;
    
    event ArbitratorLicensed(uint id, address buyer, uint256 price, bool acceptAny);

    // TODO:
    // func buyLicense
    // func getLicense


}