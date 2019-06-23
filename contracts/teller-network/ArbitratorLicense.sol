pragma solidity ^0.5.8;

import "./License.sol";

/**
* @title ArbitratorLicense
* @dev Contract for management of an arbitrator license
*/
contract ArbitratorLicense is License{

	struct ArbitratorLicenseDetails {
        uint id; 
        bool acceptAny; // accept any seller
        address[] accepted; // addresses of accepted sellers
    	bool isActive; // is license active?
    }

    mapping(address => ArbitratorLicenseDetails) arbitratorlicenseDetails;
    
    event ArbitratorLicensed(uint id, bool acceptAny);
    event SellerAccepted(address arbitrator, address seller);


    /**
     * @notice Buy an arbitrator license
     * @param _acceptAny indicates does arbitrator allow to accept any seller/choose sellers 
     */
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

    /**
     * @notice Allows arbitrator to accept a seller
     * @param _seller address of an accepted seller
     */
    function acceptSeller(address _seller) public {
		require(arbitratorlicenseDetails[msg.sender].isActive, "Arbiter should have a valid license");   	
 		require(!arbitratorlicenseDetails[msg.sender].acceptAny, "Arbiter already acceps all cases");

 		arbitratorlicenseDetails[msg.sender].accepted.push(_seller);
 		emit SellerAccepted(msg.sender, _seller);
    }

    // func getLicense
    
    // func cancel license
}