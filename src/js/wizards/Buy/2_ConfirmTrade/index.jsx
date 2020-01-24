import React, {Component, Fragment} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import newBuy from "../../../features/newBuy";
import network from "../../../features/network";
import {connect} from "react-redux";
import metadata from "../../../features/metadata";
import {States} from "../../../utils/transaction";
import Loading from "../../../components/Loading";
import ErrorInformation from "../../../components/ErrorInformation";
import escrow from "../../../features/escrow";
import Identicon from "../../../components/UserInformation/Identicon";
import {limitDecimals} from '../../../utils/numbers';
import {Alert} from "reactstrap";
import {askPermission} from '../../../utils/notifUtils';
import {withTranslation} from "react-i18next";
import DOMPurify from "dompurify";
import {formatArbitratorName, renderContactDetails, stringToContact} from '../../../utils/strings';
import PriceWarning from '../../../components/PriceWarning';

import './index.scss';

class ConfirmTrade extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ready: false,
      notificationAccepted: null
    };

    props.footer.onNext(() => {
      this.postEscrow();
      props.footer.hide();
    });
  }

  componentDidMount() {
    if (!this.props.price || !this.props.currencyQuantity || !this.props.assetQuantity) {
      return this.props.wizard.previous();
    }
    if (this.props.profile && (!this.props.username || !this.props.contactData)) {
      const contactObject = stringToContact(this.props.profile && this.props.profile.contactData);
      this.props.setContactInfo({username: DOMPurify.sanitize(this.props.profile.username), contactMethod: DOMPurify.sanitize(contactObject.method), contactUsername: DOMPurify.sanitize(contactObject.userId)});
    }

    this.props.footer.enableNext();

    this.setState({ready: true});

    askPermission().then(() => {
      this.setState({notificationAccepted: true});
    }).catch(() => {
      this.setState({notificationAccepted: false});
    });
  }

  postEscrow = () => {
    this.props.createEscrow(this.props.username, this.props.assetQuantity, this.props.currencyQuantity, this.props.contactData, this.props.offer);
  };

  resetTradeError = () => {
    this.props.resetCreateStatus();
    this.props.footer.show();
  };

  _calcPrice = () => {
    const marginPrice = this.props.offer.margin / 100 * this.props.price;
    return this.props.price + marginPrice;
  };

  componentDidUpdate() {
    if (this.props.createEscrowStatus === States.success && !isNaN(this.props.escrowId)) {
      this.props.resetCreateStatus();
      this.props.resetNewBuy();
      return this.props.history.push('/escrow/' + this.props.escrowId);
    }
  }

  componentWillUnmount() {
    if (this.props.createEscrowStatus === States.failed) {
      this.props.resetCreateStatus();
    }
  }

  render() {
    const {t} = this.props;
    if (!this.state.ready) {
      return <Loading page/>;
    }

    const price = this._calcPrice();

    switch (this.props.createEscrowStatus) {
      case States.pending:
        return <Loading mining txHash={this.props.txHash}/>;
      case States.failed:
        return <ErrorInformation transaction retry={this.postEscrow} cancel={this.resetTradeError}/>;
      case States.none: {
        return (<div className="confirmTrade">
          {this.state.notificationAccepted === null && <Alert color="info">
            <p className="mb-1">{t('notifications.youWillBeAsked')}</p>
            <p className="mb-0">{t('notifications.onlyToInform')}</p>
          </Alert>}
          <h2>Summary</h2>
          <h3 className="mt-4 font-weight-normal">Seller</h3>
          <div className="mt-2 font-weight-medium mb-1">
            <Identicon seed={this.props.offer.owner} className="rounded-circle border mr-2 mb-4 float-left" scale={5}/>
            <p className="font-weight-medium mb-0 name">{this.props.offer.user.username}</p>
            {renderContactDetails(t, this.props.offer.user.contactData, this.props.offer.owner, 'mb-0')}
          </div>

          <h3 className="mt-4 font-weight-normal">Arbitrator</h3>
          <div className="mt-2 font-weight-medium mb-1">
            <Identicon seed={this.props.offer.arbitrator} className="rounded-circle border mr-2 mb-4 float-left" scale={5}/>
            <p className="font-weight-medium mb-0 name">{formatArbitratorName(this.props.offer.arbitratorData, this.props.offer.arbitrator)}</p>
            {renderContactDetails(t, this.props.offer.arbitratorData.contactData, this.props.offer.arbitrator, 'mb-0')}
          </div>

          <h3 className="font-weight-normal mt-4">Price</h3>
          <p className="mt-2 font-weight-medium mb-1">
            1 {this.props.offer.token.symbol} = {price.toFixed(4)} {this.props.offer.currency}
          </p>

          <PriceWarning
            currentPrice={this.props.price}
            fiatAmount={this.props.currencyQuantity * 100}
            fiatSymbol={this.props.offer.currency}
            margin={this.props.offer.margin}
            tokenAmount={this.props.assetQuantity}
            tokenSymbol={this.props.offer.token.symbol}
          />

          <h3 className="font-weight-normal">Trade amount</h3>
          <p className="mt-2 font-weight-medium mb-1">
            {limitDecimals(this.props.currencyQuantity, 2)} {this.props.offer.currency} ~ {limitDecimals(this.props.assetQuantity)} {this.props.offer.token.symbol}
          </p>
        </div>);
      }
      default:
        return <Fragment/>;
    }
  }
}

ConfirmTrade.propTypes = {
  t: PropTypes.func,
  history: PropTypes.object,
  contactData: PropTypes.string,
  wizard: PropTypes.object,
  footer: PropTypes.object,
  profile: PropTypes.object,
  username: PropTypes.string,
  statusContactCode: PropTypes.string,
  resetCreateStatus: PropTypes.func,
  resetNewBuy: PropTypes.func,
  createEscrow: PropTypes.func,
  setContactInfo: PropTypes.func,
  createEscrowStatus: PropTypes.string,
  price: PropTypes.number,
  escrowId: PropTypes.string,
  txHash: PropTypes.string,
  currencyQuantity: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  assetQuantity: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  offer: PropTypes.object
};

const mapStateToProps = state => {
  const offerId = newBuy.selectors.offerId(state);
  const address = network.selectors.getAddress(state);

  return {
    txHash: escrow.selectors.txHash(state),
    escrowId: escrow.selectors.getCreateEscrowId(state),
    statusContactCode: newBuy.selectors.statusContactCode(state),
    contactData: newBuy.selectors.contactData(state),
    username: newBuy.selectors.username(state),
    ensError: network.selectors.getENSError(state),
    createEscrowStatus: escrow.selectors.getCreateEscrowStatus(state),
    price: newBuy.selectors.price(state),
    offer: metadata.selectors.getOfferById(state, offerId),
    assetQuantity: newBuy.selectors.assetQuantity(state),
    currencyQuantity: newBuy.selectors.currencyQuantity(state),
    profile: metadata.selectors.getProfile(state, address),
    offerId
  };
};

export default connect(
  mapStateToProps,
  {
    createEscrow: escrow.actions.createEscrow,
    setContactInfo: newBuy.actions.setContactInfo,
    resetCreateStatus: escrow.actions.resetCreateStatus,
    resetNewBuy: newBuy.actions.resetNewBuy
  }
)(withRouter(withTranslation()(ConfirmTrade)));
