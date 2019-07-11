/* solium-disable security/no-block-members */
pragma solidity >=0.5.0 <0.6.0;

import "../common/Ownable.sol";
import "../token/ERC20Token.sol";
import "./KyberNetworkProxy.sol";


contract KyberFeeBurner is Ownable {

  address public SNT;
  address public burnAddress;
  address public walletId;
  KyberNetworkProxy public kyberNetworkProxy;

  address constant internal ETH_TOKEN_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

  constructor(address _snt, address _burnAddress, address _kyberNetworkProxy, address _walletId) public {
    SNT = _snt;
    burnAddress = _burnAddress;
    kyberNetworkProxy = KyberNetworkProxy(_kyberNetworkProxy);
    walletId = _walletId;
  }

  event SNTAddressChanged(address sender, address prevSNTAddress, address newSNTAddress);

  function setSNT(address _snt) external onlyOwner {
    emit SNTAddressChanged(msg.sender, SNT, _snt);
    SNT = _snt;
  }

  event BurnAddressChanged(address sender, address prevBurnAddress, address newBurnAddress);

  function setBurnAddress(address _burnAddress) external onlyOwner {
    emit BurnAddressChanged(msg.sender, burnAddress, _burnAddress);
    burnAddress = _burnAddress;
  }

  event KyberNetworkProxyAddressChanged(address sender, address prevKyberAddress, address newKyberAddress);

  function setKyberNetworkProxyAddress(address _kyberNetworkProxy) external onlyOwner {
    emit KyberNetworkProxyAddressChanged(msg.sender, address(kyberNetworkProxy), _kyberNetworkProxy);
    kyberNetworkProxy = KyberNetworkProxy(_kyberNetworkProxy);
  }

  event WalletIdChanged(address sender, address prevWalletId, address newWalletId);

  function setWalletId(address _walletId) external onlyOwner {
    emit WalletIdChanged(msg.sender, walletId, _walletId);
    walletId = _walletId;
  }

  event Swap(address sender, address srcToken, address destToken, uint srcAmount, uint destAmount);

  function swap(address _token) external {
    uint balance = 0;
    uint minConversionRate = 0;
    uint destAmount = 0;

    if(_token == address(0)){
      balance = address(this).balance;
      (minConversionRate, ) = kyberNetworkProxy.getExpectedRate(ETH_TOKEN_ADDRESS, SNT, balance);
      destAmount = kyberNetworkProxy.trade.value(balance)(ETH_TOKEN_ADDRESS, balance, SNT, burnAddress, 0 - uint256(1), minConversionRate, walletId);
      emit Swap(msg.sender, ETH_TOKEN_ADDRESS, SNT, balance, destAmount);
    } else {
      ERC20Token t = ERC20Token(_token);
      balance = t.balanceOf(address(this));
      if(_token == SNT){
        require(t.transfer(burnAddress, balance), "SNT transfer failure");
        emit Swap(msg.sender, SNT, SNT, balance, balance);
        return;
      } else {
         // Mitigate ERC20 Approve front-running attack, by initially setting allowance to 0
         require(ERC20Token(_token).approve(address(kyberNetworkProxy), 0), "Failed to reset approval");

         // Set the spender's token allowance to tokenQty
         require(ERC20Token(_token).approve(address(kyberNetworkProxy), balance), "Failed to approve trade amount");

        (minConversionRate, ) = kyberNetworkProxy.getExpectedRate(_token, SNT, balance);
        destAmount = kyberNetworkProxy.trade(_token, balance, SNT, burnAddress, 0 - uint256(1), minConversionRate, walletId);

        emit Swap(msg.sender, _token, SNT, balance, destAmount);
      }
    }
  }

  event EscapeTriggered(address sender, address token, uint amount);

  function escape(address _token) external onlyOwner {
    if(_token == address(0)){
      uint ethBalance = address(this).balance;
      address(uint160(owner())).transfer(ethBalance);
      emit EscapeTriggered(msg.sender, _token, ethBalance);
    } else {
      ERC20Token t = ERC20Token(_token);
      uint tokenBalance = t.balanceOf(address(this));
      require(t.transfer(owner(), tokenBalance), "Token transfer error");
      emit EscapeTriggered(msg.sender, _token, tokenBalance);
    }
  }

  function () payable external {
  }

}