pragma solidity ^0.5.7;
/**
 * @title KyberNetworkProxy
 * @dev Mock of the KyberNetworkProxy. Only used in development
 */
contract KyberNetworkProxy {

    constructor() public {
    }

    /**
     * @dev Get a mocked up rate for the trade
     * @param src Address of the source token
     * @param dest Address of the destination token
     * @param srcQty Quantity of the source token
     */
    function getExpectedRate(address src, address dest, uint srcQty)
        public view
        returns(uint expectedRate, uint slippageRate)
    {
        return (32749000000000000000, 31766530000000000000);
    }

    /// @notice use token address ETH_TOKEN_ADDRESS for ether
    /// @dev makes a trade between src and dest token and send dest token to destAddress
    /// @param src Src token
    /// @param srcAmount amount of src tokens
    /// @param dest   Destination token
    /// @param destAddress Address to send tokens to
    /// @param maxDestAmount A limit on the amount of dest tokens
    /// @param minConversionRate The minimal conversion rate. If actual rate is lower, trade is canceled.
    /// @param walletId is the wallet ID to send part of the fees
    /// @return amount of actual dest tokens
    function trade(
        address src,
        uint srcAmount,
        address dest,
        address destAddress,
        uint maxDestAmount,
        uint minConversionRate,
        address walletId
    )
        public
        payable
        returns(uint)
    {
      return maxDestAmount;
    }

    /// @dev makes a trade between src and dest token and send dest tokens to msg sender
    /// @param src Src token
    /// @param srcAmount amount of src tokens
    /// @param dest Destination token
    /// @param minConversionRate The minimal conversion rate. If actual rate is lower, trade is canceled.
    /// @return amount of actual dest tokens
    function swapTokenToToken(
        address src,
        uint srcAmount,
        address dest,
        uint minConversionRate
    )
        public
        returns(uint)
    {
        return 100;
    }

    /// @dev makes a trade from Ether to token. Sends token to msg sender
    /// @param token Destination token
    /// @param minConversionRate The minimal conversion rate. If actual rate is lower, trade is canceled.
    /// @return amount of actual dest tokens
    function swapEtherToToken(address token, uint minConversionRate) public payable returns(uint) {
        return 200;
    }
}
