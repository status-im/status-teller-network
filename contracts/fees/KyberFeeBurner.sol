/* solium-disable security/no-block-members */
pragma solidity >=0.5.0 <0.6.0;

import "../common/Ownable.sol";
import "../token/ERC20Token.sol";
import "./KyberNetworkProxy.sol";

contract KyberFeeBurner is Ownable {

  address public SNT;
  address public burnAddress;
  KyberNetworkProxy public kyberNetworkProxy;

  constructor(address _snt, address _burnAddress, address _kyberNetworkProxy) public {
    SNT = _snt;
    burnAddress = _burnAddress;
    kyberNetworkProxy = KyberNetworkProxy(_kyberNetworkProxy);
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

  function swap(address _token) external {
    if(_token == address(0)){
      uint ethBalance = address(this).balance;
      (uint minConversionRate,) = kyberNetworkProxy.getExpectedRate(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE, SNT, ethBalance);
      kyberNetworkProxy.swapEtherToToken.value(ethBalance)(SNT, minConversionRate);
    } else {
      ERC20Token t = ERC20Token(_token);
      uint tokenBalance = t.balanceOf(address(this));
      if(_token == SNT){
        t.transfer(burnAddress, tokenBalance);
      } else {
        // TODO: swapTokenToToken()
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

}