import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";

import newSeller from "../../../features/newSeller";
import metadata from "../../../features/metadata";
import network from "../../../features/network";
import {States} from "../../../utils/transaction";
import {askPermission} from '../../../utils/notifUtils';

import Loading from "../../../components/Loading";
import ErrorInformation from "../../../components/ErrorInformation";
import Success from "../7_Limits/components/Success";
import SellSummary from "./components/SellSummary";
import {Alert} from "reactstrap";
import {withNamespaces} from "react-i18next";

class Summary extends Component {
  state = {ready: false, notificationAccepted: null};

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

    askPermission().then(() => {
      this.setState({notificationAccepted: true});
    }).catch(() => {
      this.setState({notificationAccepted: false});
    });

    this.props.getOfferPrice();
  }

  postOffer = () => {
    this.props.footer.hide();
    this.props.addOffer(this.props.seller, this.props.offerStake);
  };

  continue = () => {
    this.props.resetAddOfferStatus();
    this.props.history.push('/buy');
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
    const {t} = this.props;
    if (!this.state.ready) {
      return <Loading page/>;
    }
    switch(this.props.addOfferStatus){
      case States.pending:
        return <Loading mining txHash={this.props.txHash}/>;
      case States.failed:
        return <ErrorInformation transaction retry={this.postOffer} cancel={this.cancel}/>;
      case States.none:
        return <Fragment>
          {this.state.notificationAccepted === null && <Alert color="info">
            <p className="mb-1">{t('notifications.youWillBeAsked')}</p>
            <p className="mb-0">{t('notifications.onlyToInform')}</p>
          </Alert>}
          {this.state.notificationAccepted === false && <Alert color="warning">
            <p className="mb-1">{t('notifications.rejected')}</p>
            <p className="mb-1">{t('notifications.desktop')}</p>
            <p className="mb-0">{t('notifications.changeSettings')}</p>
          </Alert>}
            <SellSummary seller={this.props.seller} stake={this.props.offerStake} profile={this.props.profile} arbitratorProfile={this.props.arbitratorProfile} assetData={this.props.assetData}/>
          </Fragment>;
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
  assetData: PropTypes.object,
  token: PropTypes.object,
  addOfferStatus: PropTypes.string,
  resetAddOfferStatus: PropTypes.func,
  wizard: PropTypes.object,
  footer: PropTypes.object,
  txHash: PropTypes.string,
  profile: PropTypes.object,
  arbitratorProfile: PropTypes.object,
  getOfferPrice: PropTypes.func,
  offerStake: PropTypes.string
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
    assetData: network.selectors.getTokenByAddress(state, seller.asset),
    offerStake: metadata.selectors.nextOfferPrice(state)
  };
};

export default connect(
  mapStateToProps,
  {
    getOfferPrice: metadata.actions.getOfferPrice,
    addOffer: metadata.actions.addOffer,
    resetAddOfferStatus: metadata.actions.resetAddOfferStatus
  }
)(withRouter(withNamespaces()(Summary)));
