import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import { checkNotEnoughETH } from '../../../utils/transaction';
import newBuy from "../../../features/newBuy";
import escrow from '../../../features/escrow';
import prices from '../../../features/prices';
import metadata from '../../../features/metadata';
import network from '../../../features/network';
import Loading from '../../../components/Loading';
import OfferTrade from './components/OfferTrade';
import {limitDecimals} from '../../../utils/numbers';
import ConnectWallet from '../../../components/ConnectWallet';
import ModalDialog from '../../../components/ModalDialog';
import { addressCompare } from '../../../utils/address';

const MIN = 0;

class Trade extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currencyQuantity: props.currencyQuantity,
      assetQuantity: props.assetQuantity,
      disabled: true,
      ready: false,
      displayDialog: true
    };

    props.footer.onPageChange(() => {
      props.setTrade(this.state.currencyQuantity, this.state.assetQuantity, this.props.price);
    });
  }

  componentDidMount() {
    if (isNaN(this.props.offerId)) {
      return this.props.history.push('/buy');
    }
    this.validate(this.props.currencyQuantity, this.props.assetQuantity);

    this.props.updateBalances();
    if (this.props.address) {
      this.props.getLastActivity(this.props.address);
    }
    this.props.loadOffers(this.props.offer.owner); // TODO Change this to only load the right offer

    this.getSellerBalance();

    this.setState({ready: true});

    if(addressCompare(this.props.offer.arbitrator, this.props.address) || addressCompare(this.props.offer.user.address, this.props.address)){
      this.props.footer.hide();
    }

  }

  displayDialog = show => (e) => {
    if(e) e.preventDefault();
    this.setState({displayDialog: show});
    return false;
  };

  getSellerBalance() {
    if (this.props.offer && this.props.offer.token) {
      this.props.updateBalance(this.props.offer.token.symbol, this.props.offer.owner);
    }
  }

  componentDidUpdate(oldProps) {
    if ((this.props.offer && !oldProps.offer) || (this.props.offer.token && !oldProps.offer.token)) {
      this.getSellerBalance();
    }
  }

  validate(currencyQuantity, assetQuantity) {
    const limitless = this.props.offer.limitL === '0' && this.props.offer.limitU === '0';
    if (limitless) {
      if (currencyQuantity <= 0 || assetQuantity <= 0) {
        this.props.footer.disableNext();
        this.setState({disabled: true});
        return;
      }
    } else {
      if ((currencyQuantity > (parseFloat(this.props.offer.limitU) / 100)) ||
        (currencyQuantity < (parseFloat(this.props.offer.limitL) / 100))) {
        this.props.footer.disableNext();
        this.setState({disabled: true});
        return;
      }
    }

    this.props.footer.enableNext();
    this.setState({disabled: false});
  }

  _calcPrice = () => {
    const marginPrice = this.props.offer.margin / 100 * this.props.price;
    return this.props.price + marginPrice;
  };

  onAssetChange = (assetQuantity) => {
    let currencyQuantity = 0;
    if(assetQuantity !== ""){
      const _assetQuantity = parseFloat(assetQuantity);
      currencyQuantity = limitDecimals(_assetQuantity * this._calcPrice());
      this.validate(currencyQuantity, _assetQuantity);
      if (isNaN(currencyQuantity)) {
        return;
      }
    }
    this.setState({assetQuantity, currencyQuantity});
  };

  onCurrencyChange = (currencyQuantity) => {
    let assetQuantity = 0;
    if(currencyQuantity !== ""){
      const _currencyQuantity = parseFloat(currencyQuantity);
      assetQuantity = limitDecimals(_currencyQuantity / this._calcPrice());
      this.validate(_currencyQuantity, assetQuantity);
      if (isNaN(assetQuantity)) {
        return;
      }
    }
    this.setState({currencyQuantity, assetQuantity});
  };

  render() {
    if (isNaN(this.props.offerId)) {
      return null;
    }
    if (!this.state.ready || !this.props.offer || !this.props.sellerBalance) {
      return <Loading page/>;
    }

    const notEnoughETH = checkNotEnoughETH(this.props.gasPrice, this.props.ethBalance);
    const canRelay = escrow.helpers.canRelay(this.props.lastActivity);

    let disabled = this.state.disabled;
    if (notEnoughETH) {
      disabled = disabled && !canRelay;
    }

    const price = this._calcPrice();

    let minToken = MIN;
    if(this.props.offer.limitL !== '0'){
      minToken = (parseFloat(this.props.offer.limitL) / 100) / price;
    }

    let maxToken = this.props.sellerBalance;
    if(this.props.offer.limitU !== '0'){
      maxToken = (parseFloat(this.props.offer.limitU) / 100) / price;
    }

    let limitless = this.props.offer.limitL === '0' && this.props.offer.limitU === '0';
    return (
    <Fragment>
        {(!this.props.isEip1102Enabled || !this.props.address) && (
          <ModalDialog display={!!this.state.displayDialog} onClose={this.displayDialog(false)} hideButton>
             <ConnectWallet enableEthereum={this.props.enableEthereum} />
          </ModalDialog>
        )}
        <OfferTrade seller={this.props.offer.user}
                  sellerAddress={this.props.offer.owner}
                  arbitrator={this.props.offer.arbitratorData}
                  arbitratorAddress={this.props.offer.arbitrator}
                  minToken={minToken}
                  maxToken={maxToken}
                  limitless={limitless}
                  limitL={this.props.offer.limitL}
                  limitU={this.props.offer.limitU}
                  price={price}
                  sellerBalance={this.props.sellerBalance}
                  asset={this.props.offer.token.symbol}
                  currency={{id: this.props.offer.currency}}
                  onClick={this.postEscrow}
                  currencyQuantity={this.state.currencyQuantity}
                  assetQuantity={this.state.assetQuantity}
                  onAssetChange={this.onAssetChange}
                  onCurrencyChange={this.onCurrencyChange}
                  disabled={disabled}
                  notEnoughETH={notEnoughETH}
                  canRelay={canRelay}
                  tokens={this.props.tokens}
                  assetAddress={this.props.offer.asset}
                  lastActivity={this.props.lastActivity}
                  address={this.props.address}
      />
    </Fragment>
    );
  }
}

Trade.propTypes = {
  history: PropTypes.object,
  setTrade: PropTypes.func,
  offer: PropTypes.object,
  address: PropTypes.string,
  currencyQuantity: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  assetQuantity: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  footer: PropTypes.object,
  statusContactCode: PropTypes.string,
  username: PropTypes.string,
  loadOffers: PropTypes.func,
  offerId: PropTypes.number,
  updateBalance: PropTypes.func,
  price: PropTypes.number,
  sellerBalance: PropTypes.string,
  lastActivity: PropTypes.number,
  getLastActivity: PropTypes.func,
  ethBalance: PropTypes.string,
  gasPrice: PropTypes.string,
  updateBalances: PropTypes.func,
  tokens: PropTypes.object,
  isEip1102Enabled: PropTypes.bool,
  enableEthereum: PropTypes.func
};

const mapStateToProps = (state) => {
  const offerId = newBuy.selectors.offerId(state);
  if (isNaN(offerId)) {
    return {};
  }
  const offer = metadata.selectors.getOfferById(state, offerId);
  const priceData = prices.selectors.getPrices(state);

  const price =  priceData && priceData[offer.token.symbol] ? priceData[offer.token.symbol][offer.currency] : null;

  return {
    isEip1102Enabled: metadata.selectors.isEip1102Enabled(state),
    statusContactCode: newBuy.selectors.statusContactCode(state),
    username: newBuy.selectors.username(state),
    currencyQuantity: newBuy.selectors.currencyQuantity(state),
    assetQuantity: newBuy.selectors.assetQuantity(state),
    address: network.selectors.getAddress(state),
    sellerBalance: network.selectors.getBalance(state, offer.token.symbol, offer.owner),
    lastActivity: escrow.selectors.getLastActivity(state),
    gasPrice: network.selectors.getNetworkGasPrice(state),
    ethBalance: network.selectors.getBalance(state, 'ETH'),
    tokens: network.selectors.getTokens(state),
    offer,
    offerId,
    price
  };
};

export default connect(
  mapStateToProps,
  {
    enableEthereum: metadata.actions.enableEthereum,
    setTrade: newBuy.actions.setTrade,
    updateBalances: network.actions.updateBalances,
    updateBalance: network.actions.updateBalance,
    loadOffers: metadata.actions.loadOffers,
    getLastActivity: escrow.actions.getLastActivity
  }
)(withRouter(Trade));
