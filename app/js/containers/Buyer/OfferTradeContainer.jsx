import React, {Component} from 'react';
import OfferTrade from '../../components/Buyer/OfferTrade';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import buyer from "../../features/buyer";
import {withRouter} from "react-router-dom";

const FAKE_ETH_PRICE = 423;
const MIN = 200;
const MAX = 600;

class OfferTradeContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fiatQty: props.fiatQty || '',
      assetQty: props.assetQty || '',
      disabled: true
    };

    props.footer.onPageChange(() => {
      this.openTrade(this.state.fiatQty, this.state.assetQty);
    });
  }

  componentDidMount() {
    if (!this.props.offerId && this.props.offerId !== 0) {
      return this.props.history.push('/buy/');
    }

    this.offerId = this.props.offerId;
    // TODO get seller and offer information
    this.setState({address: '0xru032320jf032jf32f'});
  }

  validate(fiatQty, assetQty) {
    if (fiatQty < 0 || assetQty < 0 || fiatQty < MIN || fiatQty > MAX) {
      this.setState({disabled: true});
      return this.props.footer.disableNext();
    }
    this.setState({disabled: false});
    this.props.footer.disableNext();
  }

  openTrade = (fiatQty, assetQty) => {
    this.props.setTrade({fiatQty, assetQty});
  };

  onAssetChange = (assetQty) => {
    assetQty = parseFloat(assetQty);
    const fiatQty = assetQty * FAKE_ETH_PRICE;
    this.validate(fiatQty, assetQty);
    if (isNaN(fiatQty)) {
      return;
    }
    this.setState({assetQty, fiatQty});
  };

  onFiatChange = (fiatQty) => {
    fiatQty = parseFloat(fiatQty);
    const assetQty = fiatQty / FAKE_ETH_PRICE;
    this.validate(fiatQty, assetQty);
    if (isNaN(assetQty)) {
      return;
    }
    this.setState({fiatQty, assetQty});
  };

  render() {
    // TODO replace this by props
    if (!this.state.address) {
      return 'Loading...';
    }
    const {fiatQty, assetQty, disabled, address} = this.state;
    return (<OfferTrade address={address} name={'Roger'} min={200} max={600} asset={'ETH'}
                        fiat={{id: 'USD', symbol: '$'}} onClick={this.openTrade} fiatQty={fiatQty} assetQty={assetQty}
                        onAssetChange={this.onAssetChange} onFiatChange={this.onFiatChange} disabled={disabled}/>);
  }
}

OfferTradeContainer.propTypes = {
  history: PropTypes.object,
  setTrade: PropTypes.func,
  offerId: PropTypes.number,
  assetQty: PropTypes.number,
  fiatQty: PropTypes.number,
  footer: PropTypes.object
};

const mapStateToProps = state => ({
  offerId: buyer.selectors.offerId(state),
  fiatQty: buyer.selectors.fiatQty(state),
  assetQty: buyer.selectors.assetQty(state)
});

export default connect(
  mapStateToProps,
  {
    setTrade: buyer.actions.setTrade
  }
)(withRouter(OfferTradeContainer));
