
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
    }

    mapping(address => ArbitratorLicenseDetails) arbitratorlicenseDetails;

    Requests[] public requests;

    event ArbitratorRequested(uint id, address seller, address arbitrator);
    event ArbitratorLicensed(uint id, bool acceptAny);
  
    event RequestAccepted(uint id, address arbitrator, address seller);
    event RequestRejected(uint id, address arbitrator, address seller);
    event RequestCanceled(uint id, address arbitrator, address seller);

    /**
     * @notice Buy an arbitrator license
     * @param _acceptAny indicates does arbitrator allow to accept any seller/choose sellers 
     */
    function buyLicense(bool _acceptAny) public {
    	uint _id = license.buy();

        arbitratorlicenseDetails[msg.sender] = ArbitratorLicenseDetails({
            id: _id,
            acceptAny: _acceptAny
        });

        emit ArbitratorLicensed(_id, _acceptAny);
    }

    /**
     * @notice Change acceptAny parameter for arbitrator
     * @param _acceptAny indicates does arbitrator allow to accept any seller/choose sellers 
     */
    function changeAcceptAny(bool _acceptAny) public {
        require(isLicenseOwner(msg.sender), "Message sender should have a valid arbitrator license");
        require(arbitratorlicenseDetails[msg.sender].acceptAny != _acceptAny, "Message sender should pass parameter different from the current one");

        arbitratorlicenseDetails[msg.sender].acceptAny = _acceptAny;         
    }

    /**
     * @notice Check if a license owner
     * @param _address address that you want to check
     */
    function isLicenseOwner(address _address) public view returns (bool) {
        bool response = license.isLicenseOwner(_address);
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
     * @notice Allows arbitrator to accept a seller's request
     * @param _id request id     
     */
    function acceptRequest(uint _id) public {
        require(isLicenseOwner(msg.sender), "Arbitrator should have a valid license");
        require(requests[_id].status == RequestStatus.AWAIT, "This request is not pending");
        require(!arbitratorlicenseDetails[msg.sender].acceptAny, "Arbitrator already accepts all cases");
        
        requests[_id].status = RequestStatus.ACCEPTED;

        emit RequestAccepted(_id, msg.sender, requests[_id].seller);
    }

    /**
     * @notice Allows arbitrator to reject a request
     * @param _id request id     
     */
    function rejectRequest(uint _id) public {
        require(isLicenseOwner(msg.sender), "Arbitrator should have a valid license");       
        require(requests[_id].status == RequestStatus.AWAIT, "This request is not pending");
        require(!arbitratorlicenseDetails[msg.sender].acceptAny, "Arbitrator accepts all cases");
        
        requests[_id].status = RequestStatus.REJECTED;

        emit RequestRejected(_id, msg.sender, requests[_id].seller);

    }

    /**
     * @notice Allows seller to cancel a request
     * @param _id request id     
     */
    function cancelRequest(uint _id) public {
        require(requests[_id].seller == msg.sender,  "This request id does not belong to the message sender");
        require(requests[_id].status == RequestStatus.AWAIT || requests[_id].status == RequestStatus.ACCEPTED, "This request is inactive");

        requests[_id].status = RequestStatus.CLOSED;

        emit RequestCanceled(_id, msg.sender, requests[_id].seller);
    }    

    /**
     * @notice Checks if Arbitrator permits to use his/her services
     * @param arbitrator arbitrators address     
     */
    function isPermitted(address payable arbitrator) public view returns(bool) {
        return arbitratorlicenseDetails[arbitrator].acceptAny; // TODO: add additional checks
    }
}   