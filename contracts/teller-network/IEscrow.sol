pragma solidity >=0.5.0 <0.6.0;

contract IEscrow {

  enum TradeType {FIAT, CRYPTO}

  enum EscrowStatus {CREATED, FUNDED, PAID, RELEASED, CANCELED}

  struct EscrowTransaction {
      uint256 offerId;
      address token;
      uint256 tokenAmount;
      uint256 expirationTime;
      uint256 rating;
      uint256 tradeAmount;
      uint256 assetPrice;
      TradeType tradeType;
      EscrowStatus status;
      address payable buyer;
      address payable seller;
      address payable arbitrator;
  }

  function create(
        uint _offerId,
        uint _tradeAmount,
        uint8 _tradeType,
        uint _assetPrice,
        bytes memory _statusContactCode,
        string memory _location,
        string memory _username,
        uint _nonce,
        bytes memory _signature
  ) public returns(uint escrowId);

  function pay(uint _escrowId) external;

  function pay_relayed(address _sender, uint _escrowId) external;

  function cancel(uint _escrowId) external;

  function cancel_relayed(address _sender, uint _escrowId) external;

  function openCase(uint  _escrowId, string calldata _motive) external;

  function openCase_relayed(address _sender, uint256 _escrowId, string calldata _motive) external;

  function getRelayData(uint _escrowId) external view returns(address payable buyer, address payable seller, address token, uint tokenAmount);

}