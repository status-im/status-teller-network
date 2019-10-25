import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";

import newSeller from "../../../features/newSeller";
import metadata from "../../../features/metadata";
import network from "../../../features/network";
import {States} from "../../../utils/transaction";

import Loading from "../../../components/Loading";
import ErrorInformation from "../../../components/ErrorInformation";
import Success from "../7_Limits/components/Success";
import SellSummary from "./components/SellSummary";

class Summary extends Component {
  state = {ready: false};

  componentDidMount() {
    // TODO check limits
    if (!(this.props.seller.useCustomLimits === false ||
      (this.props.seller.useCustomLimits === true && this.props.seller.limitL >= 0 && this.props.seller.limitU >= 0))) {
      return this.props.wizard.previous();
    }
    this.setState({ready: true});
    this.props.footer.enableNext();
    this.offerCreated = false;
    this.props.footer.onNext(this.postOffer);
  }

  postOffer = () => {
    this.props.footer.hide();
    this.props.addOffer(this.props.seller);
  };

  continue = () => {
    this.props.resetAddOfferStatus();
    this.props.history.push('/offers/list');
  };

  cancel = () => {
    this.props.resetAddOfferStatus();
    this.props.footer.onNext(this.postOffer);
    this.props.footer.show();
  };

  componentDidUpdate() {
    if (this.props.addOfferStatus === States.success && !this.offerCreated) {
      this.offerCreated = true;
      this.props.footer.hide();
    } else {
      this.offerCreated = false;
    }
  }

  render() {
    if (!this.state.ready) {
      return <Loading page/>;
    }
    switch(this.props.addOfferStatus){
      case States.pending:
        return <Loading mining txHash={this.props.txHash}/>;
      case States.failed:
        return <ErrorInformation transaction retry={this.postOffer} cancel={this.cancel}/>;
      case States.none:
        return <SellSummary seller={this.props.seller} profile={this.props.profile} arbitratorProfile={this.props.arbitratorProfile} assetData={this.props.assetData}/>;
      case States.success:
        return <Success onClick={this.continue} />;
      default:
        return <Fragment/>;
    }
  }
}

Summary.propTypes = {
  t: PropTypes.func,
  history: PropTypes.object,
  addOffer: PropTypes.func,
  setLimits: PropTypes.func,
  seller: PropTypes.object,
  token: PropTypes.object,
  addOfferStatus: PropTypes.string,
  resetAddOfferStatus: PropTypes.func,
  wizard: PropTypes.object,
  footer: PropTypes.object,
  txHash: PropTypes.string,
  profile: PropTypes.object,
  arbitratorProfile: PropTypes.object
};

const mapStateToProps = state => {
  const defaultAccount = network.selectors.getAddress(state);
  const seller = newSeller.selectors.getNewSeller(state);
  return {
    seller: seller,
    addOfferStatus: metadata.selectors.getAddOfferStatus(state),
    txHash: metadata.selectors.getAddOfferTx(state),
    profile: metadata.selectors.getProfile(state, defaultAccount),
    arbitratorProfile: metadata.selectors.getProfile(state, seller.arbitrator),
    assetData: network.selectors.getTokenByAddress(state, seller.asset)
  };
};

export default connect(
  mapStateToProps,
  {
    addOffer: metadata.actions.addOffer,
    resetAddOfferStatus: metadata.actions.resetAddOfferStatus
  }
)(withRouter(Summary));
