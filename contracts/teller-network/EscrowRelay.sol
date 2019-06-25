/* solium-disable security/no-block-members */
/* solium-disable security/no-inline-assembly */
/* solium-disable no-empty-blocks */

pragma solidity ^0.5.8;

import "./Escrow.sol";
import "./EscrowManagement.sol";
import "./MetadataStore.sol";
import "../common/Ownable.sol";
import "tabookey-gasless/contracts/RelayRecipient.sol";

/**
 * @title Escrow Relay (GSN)
 */
contract EscrowRelay is RelayRecipient, Ownable {

  EscrowManagement public factory;
  MetadataStore public metadataStore;

  mapping(address => uint) public lastActivity;

  bytes4 constant CREATE_SIGNATURE = bytes4(keccak256("create(uint256,uint256,uint8,uint256,bytes,string,string,uint,bytes)"));
  bytes4 constant PAY_SIGNATURE = bytes4(keccak256("pay(address)"));
  bytes4 constant CANCEL_SIGNATURE = bytes4(keccak256("cancel(address)"));
  bytes4 constant OPEN_CASE_SIGNATURE = bytes4(keccak256("openCase(address,string)"));

  uint32 constant OK = 0;
  uint32 constant ERROR_ENOUGH_BALANCE = 11;
  uint32 constant ERROR_NOT_ETH = 12;
  uint32 constant ERROR_TRX_TOO_SOON = 13;
  uint32 constant ERROR_INVALID_BUYER = 14;

  /**
   * @param _factory Escrow Factory Address
   * @param _metadataStore Metadata Store Address
   */
  constructor(address _factory, address _metadataStore) public {
    factory = EscrowManagement(_factory);
    metadataStore = MetadataStore(_metadataStore);
  }

  /**
   * @notice Set factory address
   * @dev Only contract owner can execute this function
   * @param _factory New escrow factory address
   */
  function setFactory(address _factory) public onlyOwner {
    factory = EscrowManagement(_factory);
  }

  /**
   * @notice Set metadata store address
   * @dev Only contract owner can execute this function
   * @param _metadataStore New metadata store address
   */
  function setMetadataStore(address _metadataStore) public onlyOwner {
    metadataStore = MetadataStore(_metadataStore);
  }

  /**
   * @notice Set gas station network hub address
   * @dev Only contract owner can execute this function
   * @param _relayHub New relay hub address
   */
  function setRelayHubAddress(address _relayHub) public onlyOwner {
    set_relay_hub(RelayHub(_relayHub));
  }

  /**
   * @notice Determine if the timeout for relaying a create/cancel transaction has passed
   * @param _account Account to verify
   * @return bool
   */
  function canCreateOrCancel(address _account) public view returns(bool) {
    return (lastActivity[_account] + 15 minutes) < block.timestamp;
  }

  /**
   * @notice Create a new escrow
   * @param _offerId Offer
   * @param _tradeAmount Amount buyer is willing to trade
   * @param _tradeType Indicates if the amount is in crypto or fiat
   * @param _assetPrice Indicates the price of the asset in the FIAT of choice
   * @param _statusContactCode The address of the status contact code
   * @param _location The location on earth
   * @param _username The username of the user
   * @param _nonce buyer's nonce
   * @param _signature buyer's signature
   */
  function create (
    uint _offerId,
    uint _tradeAmount,
    uint8 _tradeType,
    uint _assetPrice,
    bytes memory _statusContactCode,
    string memory _location,
    string memory _username,
    uint _nonce,
    bytes memory _signature
  ) public returns (address instance) {
    lastActivity[get_sender()] = block.timestamp;
    instance = factory.create(
      _offerId,
      _tradeAmount,
      _tradeType,
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
   * @param _escrow Escrow to mark as paid
   */
  function pay(address _escrow) public {
    address sender = get_sender();
    Escrow(_escrow).pay_relayed(sender);
  }

  /**
   * @notice Cancel an escrow
   * @param _escrow Escrow to cancel
   */
  function cancel(address _escrow) public {
    address sender = get_sender();
    lastActivity[sender] = block.timestamp;
    Escrow(_escrow).cancel_relayed(sender);
  }

  /**
   * @notice Open a dispute
   * @param _escrow Escrow to open a dispute
   * @param _motive Motive a dispute is being opened
   */
  function openCase(address _escrow, string memory _motive) public {
    address sender = get_sender();
    Escrow(_escrow).openCase_relayed(sender, _motive);
  }

  // ========================================================================
  // Gas station network

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

    // TODO: should we allow payments and opening disputes no matter wat kind of trx is being done?

    if(fSign == PAY_SIGNATURE || fSign == CANCEL_SIGNATURE || fSign == OPEN_CASE_SIGNATURE){
        address escrow;
        assembly {
          escrow := mload(add(encoded_function, 36))
        }

        if(Escrow(escrow).buyer() != from) return ERROR_INVALID_BUYER;

        if(metadataStore.getAsset(Escrow(escrow).offerId()) != address(0)) return ERROR_NOT_ETH;

        if(fSign == CANCEL_SIGNATURE){ // Allow activity after 15min have passed
            if((lastActivity[from] + 15 minutes) > block.timestamp) return ERROR_TRX_TOO_SOON;
        }
    } else if(fSign == CREATE_SIGNATURE) {
      uint256 offerId;
      assembly {
          offerId := mload(add(encoded_function, 36))
      }
      if(metadataStore.getAsset(offerId) != address(0)) return ERROR_NOT_ETH;

      // Allow activity after 15 min have passed
      if((lastActivity[from] + 15 minutes) > block.timestamp) return ERROR_TRX_TOO_SOON;
    }

    return OK;
  }

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