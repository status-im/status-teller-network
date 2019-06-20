import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import MarginSelectorForm from './components/MarginSelectorForm';
import Loading from '../../../components/Loading';
import newSeller from "../../../features/newSeller";
import network from '../../../features/network';
import escrow from '../../../features/escrow';
import prices from '../../../features/prices';
import metadata from "../../../features/metadata";
import {States} from "../../../utils/transaction";
import ErrorInformation from '../../../components/ErrorInformation';
import {withRouter} from "react-router-dom";

import "./index.scss";

class Margin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      margin: props.seller.margin,
      ready: false
    };
    this.validate(props.seller.margin);
    props.getFeeMilliPercent();

    props.footer.onPageChange(() => {
      props.setMargin(this.state.margin);
    });
    props.footer.onNext(this.postOffer);
  }

  postOffer = () => {
    this.props.footer.hide();
    this.props.addOffer({...this.props.seller, margin: this.state.margin});
  };

  componentDidMount() {
    if (!this.props.seller.currency && this.props.addOfferStatus !== States.success) {
      this.props.wizard.previous();
    } else {
      this.setState({ready: true});
    }
  }

  componentDidUpdate() {
    if (this.props.addOfferStatus === States.success) {
      this.props.history.push('/profile');
      this.props.resetAddOfferStatus();
    }
  }

  validate(margin) {
    if ((margin || margin === 0) && margin <= 100 && margin > -100) {
      return this.props.footer.enableNext();
    }
    this.props.footer.disableNext();
  }

  marginChange = (margin) => {
    margin = parseInt(margin, 10);
    if (isNaN(margin)) {
      margin = '';
    }
    this.validate(margin);
    this.setState({margin});
  };

  render() {
    if (!this.state.ready) {
      return <Loading page/>;
    }

    switch(this.props.addOfferStatus){
      case States.pending:
        return <Loading mining txHash={this.props.txHash}/>;
      case States.failed:
        return <ErrorInformation transaction retry={this.postOffer} cancel={this.props.resetAddOfferStatus}/>;
      case States.none:
        return (
          <MarginSelectorForm token={this.props.token}
                              prices={this.props.prices}
                              currency={this.props.seller.currency}
                              margin={this.state.margin}
                              marginChange={this.marginChange}
                              feeMilliPercent={this.props.feeMilliPercent} />
        );
      default:
        return <Fragment/>;
    }
  }
}

Margin.propTypes = {
  t: PropTypes.func,
  history: PropTypes.object,
  addOffer: PropTypes.func,
  prices: PropTypes.object,
  setMargin: PropTypes.func,
  seller: PropTypes.object,
  token: PropTypes.object,
  addOfferStatus: PropTypes.string,
  resetAddOfferStatus: PropTypes.func,
  wizard: PropTypes.object,
  footer: PropTypes.object,
  getFeeMilliPercent: PropTypes.func,
  feeMilliPercent: PropTypes.string,
  txHash: PropTypes.string
};

const mapStateToProps = state => ({
  seller: newSeller.selectors.getNewSeller(state),
  addOfferStatus: metadata.selectors.getAddOfferStatus(state),
  token: network.selectors.getTokenByAddress(state, newSeller.selectors.getNewSeller(state).asset),
  prices: prices.selectors.getPrices(state),
  feeMilliPercent: escrow.selectors.feeMilliPercent(state),
  txHash: metadata.selectors.getAddOfferTx(state)
});

export default connect(
  mapStateToProps,
  {
    setMargin: newSeller.actions.setMargin,
    addOffer: metadata.actions.addOffer,
    resetAddOfferStatus: metadata.actions.resetAddOfferStatus,
    getFeeMilliPercent: escrow.actions.getFeeMilliPercent

  }
)(withRouter(Margin));
