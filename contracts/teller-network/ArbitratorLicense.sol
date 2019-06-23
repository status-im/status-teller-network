pragma solidity ^0.5.8;

import "./License.sol";

contract ArbitratorLicense is License{

	struct ArbitratorLicenseDetails {
        uint id; 
        bool acceptAny; // accept any seller
        address[] accepted; // addresses of accepted sellers
    	bool isActive; // is license active?
    }

    mapping(address => ArbitratorLicenseDetails) arbitratorlicenseDetails;
    
    event ArbitratorLicensed(uint id, bool acceptAny);

    function buyLicense(bool _acceptAny) public {
    	uint _id = buy();
    	address[] memory addresses;

        arbitratorlicenseDetails[msg.sender] = ArbitratorLicenseDetails({
            id: _id,
            acceptAny: _acceptAny,
            accepted: addresses,    
 			isActive:  true			
        });

        emit ArbitratorLicensed(_id, _acceptAny);
    }

    // func acceptSeller

    // func getLicense
    
}