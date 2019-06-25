
pragma solidity ^0.5.8;

import "./License.sol";

/**
* @title ArbitratorLicense
* @dev Contract for management of an arbitrator license
*/
contract ArbitratorLicense {

    License public license;

    enum RequestStatus {AWAIT,ACCEPTED,REJECTED, CLOSED}

    struct Requests{
        address seller;
        address arbitrator;
        RequestStatus status;
    }

	struct ArbitratorLicenseDetails {
        uint id; 
        bool acceptAny; // accept any seller
        address[] accepted; // addresses of accepted sellers
    }

    mapping(address => ArbitratorLicenseDetails) arbitratorlicenseDetails;

    Requests[] public requests;
    mapping(uint => uint[]) public requestsById;

    event ArbitratorRequested(uint id, address seller, address arbitrator);
    event ArbitratorLicensed(uint id, bool acceptAny);
    event RequestAccepted(address arbitrator, address seller);

    /**
     * @notice Buy an arbitrator license
     * @param _acceptAny indicates does arbitrator allow to accept any seller/choose sellers 
     */
    function buyLicense(bool _acceptAny) public {
    	uint _id = license.buy();
    	address[] memory addresses;

        arbitratorlicenseDetails[msg.sender] = ArbitratorLicenseDetails({
            id: _id,
            acceptAny: _acceptAny,
            accepted: addresses    
        });

        emit ArbitratorLicensed(_id, _acceptAny);
    }

    /**
     * @notice Check if a license owner
     * @param _address address that you want to check
     */
    function isLicenseOwner(address _address) public view returns (bool) {
        bool response =license.isLicenseOwner(_address);
        return response;
    }

    /**
     * @notice Allows arbitrator to accept a seller
     * @param _arbitrator address of a licensed arbitrator
     */
    function requestArbitrator(address _arbitrator) public {
       require(isLicenseOwner(_arbitrator), "Arbitrator should have a valid license");
       require(!arbitratorlicenseDetails[_arbitrator].acceptAny, "Arbitrator already acceps all cases");

       uint _id = requests.length++;

       requests[_id] = Requests({
            seller: msg.sender,
            arbitrator: _arbitrator,    
            status:  RequestStatus.AWAIT         
       });
       emit ArbitratorRequested(_id, msg.sender, _arbitrator );
    }

    /**
     * @notice Allows arbitrator to accept a seller
     * @param _seller address of an accepted seller
     * @param _id request id     
     */
    function acceptRequest(address _seller, uint _id) public {
        require(isLicenseOwner(msg.sender), "Arbitrator should have a valid license");
        require(!arbitratorlicenseDetails[msg.sender].acceptAny, "Arbitrator already acceps all cases");
        
        requests[_id].status = RequestStatus.ACCEPTED;

        arbitratorlicenseDetails[msg.sender].accepted.push(_seller);
        emit RequestAccepted(msg.sender, _seller);
    }

    // TODO:
    // func reject seller
    // func deactivate license
    // func getLicense
    // func cancel arbitrator
}