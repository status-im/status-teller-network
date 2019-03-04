import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";

import newBuy from "../../../features/newBuy";
import escrow from '../../../features/escrow';
import metadata from '../../../features/metadata';
import network from '../../../features/network';
import Loading from '../../../components/Loading';
import OfferTrade from './components/OfferTrade';

const FAKE_ETH_PRICE = 423;
const MIN = 200;
const MAX = 600;

class Trade extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currencyQuantity: props.currencyQuantity,
      assetQuantity: props.assetQuantity,
      disabled: true
    };
    props.footer.onPageChange(() => {
      props.setTrade(this.state.currencyQuantity, this.state.assetQuantity);
    });
  }

  componentDidMount() {
    if (isNaN(this.props.offerId)) {
      return this.props.history.push('/');
    }
    this.props.loadOffers();
  }

  validate(currencyQuantity, assetQuantity) {
    if (currencyQuantity < 0 || assetQuantity < 0 || currencyQuantity < MIN || currencyQuantity > MAX) {
      this.setState({disabled: true});
      return;
    }
    this.setState({disabled: false});
  }

  postEscrow = () => {
    this.props.createEscrow(this.props.address, this.props.username, this.state.assetQuantity, this.props.statusContactCode, this.props.offer);
  };

  onAssetChange = (assetQuantity) => {
    assetQuantity = parseFloat(assetQuantity);
    const currencyQuantity = assetQuantity * FAKE_ETH_PRICE;
    this.validate(currencyQuantity, assetQuantity);
    if (isNaN(currencyQuantity)) {
      return;
    }
    this.setState({assetQuantity, currencyQuantity});
  };

  onCurrencyChange = (currencyQuantity) => {
    currencyQuantity = parseFloat(currencyQuantity);
    const assetQuantity = currencyQuantity / FAKE_ETH_PRICE;
    this.validate(currencyQuantity, assetQuantity);
    if (isNaN(assetQuantity)) {
      return;
    }
    this.setState({currencyQuantity, assetQuantity});
  };

  render() {
    if (!this.props.offer) {
      return <Loading page/>;
    }

    return (<OfferTrade address={this.props.offer.owner}
                        name={this.props.offer.user.username}
                        min={200}
                        max={600}
                        asset={'ETH'}
                        currency={{id: 'USD', symbol: '$'}}
                        onClick={this.postEscrow}
                        currencyQuantity={this.state.currencyQuantity}
                        assetQuantity={this.state.assetQuantity}
                        onAssetChange={this.onAssetChange}
                        onCurrencyChange={this.onCurrencyChange}
                        disabled={this.state.disabled}/>);
  }
}

Trade.propTypes = {
  history: PropTypes.object,
  setTrade: PropTypes.func,
  offer: PropTypes.object,
  address: PropTypes.string,
  currencyQuantity: PropTypes.number,
  assetQuantity: PropTypes.number,
  footer: PropTypes.object,
  statusContactCode: PropTypes.string,
  username: PropTypes.string,
  loadOffers: PropTypes.func,
  offerId: PropTypes.number,
  createEscrow: PropTypes.func
};

const mapStateToProps = (state) => {
  const offerId = newBuy.selectors.offerId(state);
  return {
    statusContactCode: newBuy.selectors.statusContactCode(state),
    username: newBuy.selectors.username(state),
    currencyQuantity: newBuy.selectors.currencyQuantity(state),
    assetQuantity: newBuy.selectors.assetQuantity(state),
    address: network.selectors.getAddress(state),
    offer: metadata.selectors.getOfferById(state, offerId),
    offerId
  };
};

export default connect(
  mapStateToProps,
  {
    setTrade: newBuy.actions.setTrade,
    createEscrow: escrow.actions.createEscrow,
    loadOffers: metadata.actions.loadOffers 
  }
)(withRouter(Trade));
