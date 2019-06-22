pragma solidity ^0.5.8;

import "./License.sol";

contract ArbitratorLicense is License{

	struct ArbitratorLicenseDetails {
        LicenseDetails licenseDetails;
        bool acceptAny; // accept any seller
        address[] accepted; // addresses of accepted sellers
    }

    mapping(address => ArbitratorLicenseDetails) arbitratorlicenseDetails;
    
    event ArbitratorLicensed(address buyer, uint256 price, bool acceptAny);




}