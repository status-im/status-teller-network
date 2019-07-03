pragma solidity ^0.5.8;

import "./License.sol";

/**
* @title ArbitratorLicense
* @dev Contract for management of an arbitrator license
*/
contract ArbitrationLicense is License {

    enum RequestStatus {AWAIT,ACCEPTED,REJECTED,CLOSED}

    struct Request{
        address seller;
        address arbitrator;
        RequestStatus status;
    }

	struct ArbitratorLicenseDetails {
        uint id;
        bool acceptAny;// accept any seller
    }

    mapping(address => ArbitratorLicenseDetails) public arbitratorlicenseDetails;
    mapping(address => mapping(address => bool)) public permissions;

    Request[] public requests;

    event ArbitratorRequested(uint id, address seller, address arbitrator);
    event ArbitratorLicensed(uint id, bool acceptAny);

    event RequestAccepted(uint id, address arbitrator, address seller);
    event RequestRejected(uint id, address arbitrator, address seller);
    event RequestCanceled(uint id, address arbitrator, address seller);

    constructor(address _tokenAddress, uint256 _price, address _burnAddress)
      License(_tokenAddress, _price, _burnAddress)
      public {}

    /**
     * @notice Buy an arbitrator license
     */
    function buy() external returns(uint) {
        return _buy(msg.sender, false);
    }

    function buy(bool _acceptAny) external returns(uint) {
        return _buy(msg.sender, _acceptAny);
    }

    function _buy(address _sender, bool _acceptAny) internal returns (uint id) {
        id = _buyFrom(_sender);
        arbitratorlicenseDetails[_sender].id = id;
        arbitratorlicenseDetails[_sender].acceptAny = _acceptAny;

        emit ArbitratorLicensed(id, _acceptAny);
    }

    /**
     * @notice Change acceptAny parameter for arbitrator
     * @param _acceptAny indicates does arbitrator allow to accept any seller/choose sellers
     */
    function changeAcceptAny(bool _acceptAny) public {
        require(isLicenseOwner(msg.sender), "Message sender should have a valid arbitrator license");
        require(arbitratorlicenseDetails[msg.sender].acceptAny != _acceptAny,
                "Message sender should pass parameter different from the current one");

        arbitratorlicenseDetails[msg.sender].acceptAny = _acceptAny;
    }

    /**
     * @notice Allows arbitrator to accept a seller
     * @param _arbitrator address of a licensed arbitrator
     */
    function requestArbitrator(address _arbitrator) public {
       require(isLicenseOwner(_arbitrator), "Arbitrator should have a valid license");
       require(!arbitratorlicenseDetails[_arbitrator].acceptAny, "Arbitrator already accepts all cases");

       uint _id = requests.length++;

       requests[_id] = Request({
            seller: msg.sender,
            arbitrator: _arbitrator,
            status: RequestStatus.AWAIT
       });
       emit ArbitratorRequested(_id, msg.sender, _arbitrator);
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

        address _seller = requests[_id].seller;
        permissions[msg.sender][_seller] = true;

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

        address _seller = requests[_id].seller;
        permissions[msg.sender][_seller] = false;

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
        address _arbitrator = requests[_id].arbitrator;
        permissions[_arbitrator][msg.sender] = false;

        emit RequestCanceled(_id, msg.sender, requests[_id].seller);
    }

    /**
     * @notice Checks if Arbitrator permits to use his/her services
     * @param _seller sellers's address
     * @param _arbitrator arbitrator's address
     */
    function isAllowed(address _seller, address _arbitrator) public view returns(bool) {
        return arbitratorlicenseDetails[_arbitrator].acceptAny || permissions[_arbitrator][_seller];
    }

    /**
     * @notice Support for "approveAndCall". Callable only by `token()`.
     * @param _from Who approved.
     * @param _amount Amount being approved, need to be equal `price()`.
     * @param _token Token being approved, need to be equal `token()`.
     * @param _data Abi encoded data with selector of `buy(and)`.
     */
    function receiveApproval(address _from, uint256 _amount, address _token, bytes memory _data) public {
        require(_amount == price, "Wrong value");
        require(_token == address(token), "Wrong token");
        require(_token == address(msg.sender), "Wrong call");
        require(_data.length == 4, "Wrong data length");

        require(_abiDecodeBuy(_data) == bytes4(0xa6f2ae3a), "Wrong method selector"); //bytes4(keccak256("buy()"))

        _buy(_from, false);
    }
}