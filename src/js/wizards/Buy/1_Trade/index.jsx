import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import { States, checkNotEnoughETH } from '../../../utils/transaction';
import newBuy from "../../../features/newBuy";
import escrow from '../../../features/escrow';
import prices from '../../../features/prices';
import metadata from '../../../features/metadata';
import network from '../../../features/network';
import Loading from '../../../components/Loading';
import ErrorInformation from '../../../components/ErrorInformation';
import OfferTrade from './components/OfferTrade';

const MIN = 0;
const MAX = 999999;

class Trade extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currencyQuantity: props.currencyQuantity,
      assetQuantity: props.assetQuantity,
      disabled: true,
      ready: false
    };

    props.footer.hide();

    props.footer.onPageChange(() => {
      props.setTrade(this.state.currencyQuantity, this.state.assetQuantity);
    });
  }

  componentDidMount() {
    if (isNaN(this.props.offerId)) {
      return this.props.history.push('/');
    }

    this.props.updateBalances();
    this.props.getLastActivity(this.props.address);
    this.props.loadOffers(this.props.offer.owner); // TODO Change this to only load the right offer

    this.getSellerBalance();

    this.setState({ready: true});
  }

  getSellerBalance() {
    if (this.props.offer && this.props.offer.token) {
      this.props.updateBalance(this.props.offer.token.symbol, this.props.offer.owner);
    }
  }

  componentDidUpdate(oldProps) {
    if (this.props.createEscrowStatus === States.success) {
      this.props.resetCreateStatus();
      return this.props.history.push('/escrow/' + this.props.escrowId);
    }

    if(!this.props.isSigning && !this.props.signature){
      return this.props.history.push('/buy/contact');
    }

    if ((this.props.offer && !oldProps.offer) || (this.props.offer.token && !oldProps.offer.token)) {
      this.getSellerBalance();
    }
  }

  validate(currencyQuantity, assetQuantity) {
    if (currencyQuantity < 0 || assetQuantity < 0 || assetQuantity > (this.props.sellerBalance || MAX)) {
      this.setState({disabled: true});
      return;
    }
    this.setState({disabled: false});
  }

  postEscrow = () => {
    this.props.createEscrow(this.props.signature, this.props.username, this.state.assetQuantity, this.props.price.toFixed(2).toString().replace('.', ''), this.props.statusContactCode, this.props.offer, this.props.nonce);
  };

  _calcPrice = () => {
    const marginPrice = this.props.offer.margin / 100 * this.props.price;
    return this.props.price + marginPrice;
  };

  onAssetChange = (assetQuantity) => {
    let currencyQuantity = 0;
    if(assetQuantity !== ""){
      assetQuantity = parseFloat(assetQuantity);
      currencyQuantity = assetQuantity * this._calcPrice();
      this.validate(currencyQuantity, assetQuantity);
      if (isNaN(currencyQuantity)) {
        return;
      }
    }
    this.setState({assetQuantity, currencyQuantity});
  };

  onCurrencyChange = (currencyQuantity) => {
    let assetQuantity = 0;
    if(currencyQuantity !== ""){
      currencyQuantity = parseFloat(currencyQuantity);
      assetQuantity = currencyQuantity / this._calcPrice();
      this.validate(currencyQuantity, assetQuantity);
      if (isNaN(assetQuantity)) {
        return;
      }
    }
    this.setState({currencyQuantity, assetQuantity});
  };

  render() {
    if (!this.state.ready || !this.props.offer || !this.props.sellerBalance || this.props.isSigning) {
      return <Loading page/>;
    }

    if (!this.props.isSigning && !this.props.signature) return null;

    const notEnoughETH = checkNotEnoughETH(this.props.gasPrice, this.props.ethBalance);
    const canRelay = escrow.helpers.canRelay(this.props.lastActivity);

    let disabled = this.state.disabled;
    if(notEnoughETH){
      disabled = disabled && !canRelay;
    }

    switch(this.props.createEscrowStatus){
      case States.pending:
        return <Loading mining txHash={this.props.txHash}/>;
      case States.failed:
        return <ErrorInformation transaction retry={this.postEscrow} cancel={this.props.resetCreateStatus}/>;
      case States.none:
        return (
          <OfferTrade statusContactCode={this.props.offer.user.statusContactCode}
                      name={this.props.offer.user.username}
                      minToken={MIN} // TODO put here real values when we have it set in the contract
                      maxToken={this.props.sellerBalance}
                      price={this._calcPrice()}
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
                      lastActivity={this.props.lastActivity}
                      />
        );
      default:
        return <Fragment/>;
    }
  }
}

Trade.propTypes = {
  history: PropTypes.object,
  setTrade: PropTypes.func,
  resetCreateStatus: PropTypes.func,
  offer: PropTypes.object,
  address: PropTypes.string,
  currencyQuantity: PropTypes.number,
  assetQuantity: PropTypes.number,
  footer: PropTypes.object,
  statusContactCode: PropTypes.string,
  txHash: PropTypes.string,
  username: PropTypes.string,
  loadOffers: PropTypes.func,
  offerId: PropTypes.number,
  createEscrow: PropTypes.func,
  updateBalance: PropTypes.func,
  createEscrowStatus: PropTypes.string,
  escrowId: PropTypes.string,
  price: PropTypes.number,
  sellerBalance: PropTypes.string,
  lastActivity: PropTypes.number,
  getLastActivity: PropTypes.func,
  ethBalance: PropTypes.string,
  gasPrice: PropTypes.string,
  updateBalances: PropTypes.func,
  isSigning: PropTypes.bool,
  signature: PropTypes.string,
  nonce: PropTypes.string
};

const mapStateToProps = (state) => {
  const offerId = newBuy.selectors.offerId(state);
  const offer = metadata.selectors.getOfferById(state, offerId);
  const priceData = prices.selectors.getPrices(state);
  const price = priceData[offer.token.symbol][offer.currency];

  return {
    createEscrowStatus: escrow.selectors.getCreateEscrowStatus(state),
    escrowId: escrow.selectors.getCreateEscrowId(state),
    txHash: escrow.selectors.txHash(state),
    statusContactCode: newBuy.selectors.statusContactCode(state),
    username: newBuy.selectors.username(state),
    currencyQuantity: newBuy.selectors.currencyQuantity(state),
    assetQuantity: newBuy.selectors.assetQuantity(state),
    address: network.selectors.getAddress(state),
    sellerBalance: network.selectors.getBalance(state, offer.token.symbol, offer.owner),
    lastActivity: escrow.selectors.getLastActivity(state),
    gasPrice: network.selectors.getNetworkGasPrice(state),
    ethBalance: network.selectors.getBalance(state, 'ETH'),
    isSigning: metadata.selectors.isSigning(state),
    signature: metadata.selectors.getSignature(state),
    nonce: metadata.selectors.getNonce(state),
    offer,
    offerId,
    price
  };
};

export default connect(
  mapStateToProps,
  {
    setTrade: newBuy.actions.setTrade,
    resetCreateStatus: escrow.actions.resetCreateStatus,
    createEscrow: escrow.actions.createEscrow,
    updateBalances: network.actions.updateBalances,
    updateBalance: network.actions.updateBalance,
    loadOffers: metadata.actions.loadOffers,
    getLastActivity: escrow.actions.getLastActivity
  }
)(withRouter(Trade));
