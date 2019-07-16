/* solium-disable security/no-block-members */
/* solium-disable security/no-inline-assembly */
/* solium-disable no-empty-blocks */

pragma solidity >=0.5.0 <0.6.0;

import "./IEscrow.sol";
import "./MetadataStore.sol";
import "../common/Ownable.sol";
import "tabookey-gasless/contracts/RelayRecipient.sol";

/**
 * @title Escrow Relay (Gas Station Network)
 */
contract EscrowRelay is RelayRecipient, Ownable {

  MetadataStore public metadataStore;
  IEscrow public escrow;
  address public snt;

  mapping(address => uint) public lastActivity;

  bytes4 constant CREATE_SIGNATURE = bytes4(keccak256("createEscrow(uint256,uint256,uint8,uint256,bytes,string,string,uint,bytes)"));
  bytes4 constant PAY_SIGNATURE = bytes4(keccak256("pay(uint256)"));
  bytes4 constant CANCEL_SIGNATURE = bytes4(keccak256("cancel(uint256)"));
  bytes4 constant OPEN_CASE_SIGNATURE = bytes4(keccak256("openCase(uint256,string)"));

  uint32 constant OK = 0;
  uint32 constant ERROR_ENOUGH_BALANCE = 11;
  uint32 constant ERROR_INVALID_ASSET = 12;
  uint32 constant ERROR_TRX_TOO_SOON = 13;
  uint32 constant ERROR_INVALID_BUYER = 14;

  /**
   * @param _metadataStore Metadata Store Address
   * @param _escrow IEscrow Instance Address
   * @param _snt SNT address
   */
  constructor(address _metadataStore, address _escrow, address _snt) public {
    metadataStore = MetadataStore(_metadataStore);
    escrow = IEscrow(_escrow);
    snt = _snt;
  }

  /**
   * @notice Set metadata store address
   * @dev Only contract owner can execute this function
   * @param _metadataStore New metadata store address
   */
  function setMetadataStore(address _metadataStore) external onlyOwner {
    metadataStore = MetadataStore(_metadataStore);
  }

  /**
   * @notice Set escrow address
   * @dev Only contract owner can execute this function
   * @param _escrow New escrow address
   */
  function setEscrow(address _escrow) external onlyOwner {
    escrow = IEscrow(_escrow);
  }

  /**
   * @notice Set gas station network hub address
   * @dev Only contract owner can execute this function
   * @param _relayHub New relay hub address
   */
  function setRelayHubAddress(address _relayHub) external onlyOwner {
    set_relay_hub(RelayHub(_relayHub));
  }

  /**
   * @notice Determine if the timeout for relaying a create/cancel transaction has passed
   * @param _account Account to verify
   * @return bool
   */
  function canCreateOrCancel(address _account) external view returns(bool) {
    return (lastActivity[_account] + 15 minutes) < block.timestamp;
  }

  /**
   * @notice Create a new escrow
   * @param _offerId Offer
   * @param _tokenAmount Amount buyer is willing to trade
   * @param _assetPrice Indicates the price of the asset in the FIAT of choice
   * @param _statusContactCode The address of the status contact code
   * @param _location The location on earth
   * @param _username The username of the user
   * @param _nonce buyer's nonce
   * @param _signature buyer's signature
   */
  function createEscrow(
    uint _offerId,
    uint _tokenAmount,
    uint _assetPrice,
    bytes memory _statusContactCode,
    string memory _location,
    string memory _username,
    uint _nonce,
    bytes memory _signature
  ) public returns (uint escrowId) {
    lastActivity[get_sender()] = block.timestamp;
    escrowId = escrow.createEscrow(
         _offerId,
         _tokenAmount,
         _assetPrice,
         _statusContactCode,
         _location,
         _username,
         _nonce,
         _signature
    );
  }

  /**
   * @notice Mark transaction as paid
   * @param _escrowId Escrow to mark as paid
   */
  function pay(uint _escrowId) external {
    address sender = get_sender();
    escrow.pay_relayed(sender, _escrowId);
  }

  /**
   * @notice Cancel an escrow
   * @param _escrowId Escrow to cancel
   */
  function cancel(uint _escrowId) external {
    address sender = get_sender();
    lastActivity[sender] = block.timestamp;
    escrow.cancel_relayed(sender, _escrowId);
  }

  /**
   * @notice Open a dispute
   * @param _escrowId Escrow to open a dispute
   * @param _motive Motive a dispute is being opened
   */
  function openCase(uint _escrowId, string memory _motive) public {
    address sender = get_sender();
    escrow.openCase_relayed(sender, _escrowId, _motive);
  }

  // ========================================================================
  // Gas station network

  /**
   * @notice Function returning if we accept or not the relayed call (do we pay or not for the gas)
   * @param relay Address of the relay hub (that transmits to the worker)
   * @param from Address of the buyer getting a free transaction
   * @param encoded_function Function that will be called on the Escrow contract
   * @param gas_price Gas price
   * @param transaction_fee Fee for the relay (unused by us)
   * @dev relay and transaction_fee give warning because they are unused, but they are useless in our relay workflow
   * @dev We cannot remove those parameters because they are called by an external contract
   */
  function accept_relayed_call(
    address relay,
    address from,
    bytes memory encoded_function,
    uint gas_price,
    uint transaction_fee
  ) public view returns(uint32) {
    bytes4 fSign;
    assembly {
      fSign := mload(add(encoded_function, add(0x20, 0)))
    }

    if(from.balance > 600000 * gas_price) return ERROR_ENOUGH_BALANCE;

    if(fSign == PAY_SIGNATURE || fSign == CANCEL_SIGNATURE || fSign == OPEN_CASE_SIGNATURE){
        uint escrowId;
        assembly {
          escrowId := mload(add(encoded_function, 36))
        }

        address token;
        address payable buyer;

        (buyer, , token, ) = escrow.getBasicTradeData(escrowId);

        if(buyer != from) return ERROR_INVALID_BUYER;
        if(token != snt && token != address(0)) return ERROR_INVALID_ASSET;

        if(fSign == CANCEL_SIGNATURE){ // Allow activity after 15min have passed
            if((lastActivity[from] + 15 minutes) > block.timestamp) return ERROR_TRX_TOO_SOON;
        }
    } else if(fSign == CREATE_SIGNATURE) {
      uint256 offerId;
      assembly {
          offerId := mload(add(encoded_function, 36))
      }

      address token = metadataStore.getAsset(offerId);

      if(token != snt && token != address(0)) return ERROR_INVALID_ASSET;

      // Allow activity after 15 min have passed
      if((lastActivity[from] + 15 minutes) > block.timestamp) return ERROR_TRX_TOO_SOON;
    }

    return OK;
  }

  /**
   * @notice Function executed after the relay. Unused by us
   * @param relay Address of the relay hub (that transmits to the worker)
   * @param from Address of the buyer getting a free transaction
   * @param encoded_function Function that will be called on the Escrow contract
   * @param success Boolean saying if the relay was a success
   * @param used_gas Gas price
   * @param transaction_fee Fee for the relay (unused by us)
   */
  function post_relayed_call(
    address relay,
    address from,
    bytes memory encoded_function,
    bool success,
    uint used_gas,
    uint transaction_fee
  ) public {
    // nothing to be done post-call.
    // still, we must implement this method.
  }
}
