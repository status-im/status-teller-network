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
import Address from "../../../components/UserInformation/Address";
import {limitDecimals} from '../../../utils/numbers';
import RoundedIcon from "../../../ui/RoundedIcon";
import infoIcon from "../../../../images/small-info.svg";
import {Col, Row, Alert} from "reactstrap";
import {askPermission} from '../../../utils/notifUtils';
import {withNamespaces} from "react-i18next";

class ConfirmTrade extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ready: false,
      notificationAccepted: null
    };
    props.footer.disableNext();
    props.footer.onNext(() => {
      this.postEscrow();
      props.footer.hide();
    });
  }

  componentDidMount() {
    if (!this.props.price || !this.props.currencyQuantity || !this.props.assetQuantity) {
      return this.props.wizard.previous();
    }
    this.setState({ready: true});

    askPermission().then(() => {
      this.setState({notificationAccepted: true});
    }).catch(() => {
      this.setState({notificationAccepted: false});
    });
  }

  postEscrow = () => {
    this.props.createEscrow(this.props.signature, this.props.username, this.props.assetQuantity, this.props.currencyQuantity, this.props.statusContactCode, this.props.offer, this.props.nonce);
  };

  cancelTrade = () => {
    return this.props.history.push('/');
  };

  componentDidUpdate(prevProps) {
    if (prevProps.signing && !this.props.signing) {
      this.props.footer.enableNext();
    }

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
    if (!this.state.ready || this.props.signing) {
      return <Loading page/>;
    }

    switch (this.props.createEscrowStatus) {
      case States.pending:
        return <Loading mining txHash={this.props.txHash}/>;
      case States.failed:
        return <ErrorInformation transaction retry={this.postEscrow} cancel={this.cancelTrade}/>;
      case States.none: {
        const fiatAmount = this.props.assetQuantity * this.props.price;
        return (<Fragment>
          {this.state.notificationAccepted === null && <Alert color="info">
            <p className="mb-1">{t('notifications.youWillBeAsked')}</p>
            <p className="mb-0">{t('notifications.onlyToInform')}</p>
          </Alert>}
          {this.state.notificationAccepted === false && <Alert color="warning">
            <p className="mb-1">{t('notifications.rejected')}</p>
            <p className="mb-1">{t('notifications.desktop')}</p>
            <p className="mb-0">{t('notifications.changeSettings')}</p>
          </Alert>}
          <h2>Summary</h2>
          <h3 className="mt-4 font-weight-normal">Seller</h3>
          <p className="mt-2 font-weight-medium mb-1">
            <Identicon seed={this.props.offer.user.statusContactCode} className="rounded-circle border mr-2" scale={5}/>
            {this.props.offer.user.username}
          </p>
          <p className="text-muted text-small"><Address address={this.props.offer.user.statusContactCode} length={6}/>
          </p>

          <h3 className="font-weight-normal">Price</h3>
          <p className="mt-2 font-weight-medium mb-1">
            1 {this.props.offer.token.symbol} = {this.props.price} {this.props.offer.currency}
          </p>
          <p className="text-muted text-small">
            <Row tag="span">
              <Col tag="span" xs={1}><RoundedIcon image={infoIcon} bgColor="secondary" className="float-left" size="sm"/></Col>
              <Col tag="span" x2={11} className="pt-1">Only continue if you are comfortable with this price</Col>
            </Row>
          </p>

          <h3 className="font-weight-normal">Trade amount</h3>
          <p className="mt-2 font-weight-medium mb-1">
            {limitDecimals(fiatAmount, 2)} {this.props.offer.currency} ~ {limitDecimals(this.props.assetQuantity)}
          </p>
        </Fragment>);
      }
      default:
        return <Fragment/>;
    }
  }
}

ConfirmTrade.propTypes = {
  t: PropTypes.func,
  history: PropTypes.object,
  wizard: PropTypes.object,
  footer: PropTypes.object,
  username: PropTypes.string,
  statusContactCode: PropTypes.string,
  resetCreateStatus: PropTypes.func,
  resetNewBuy: PropTypes.func,
  createEscrow: PropTypes.func,
  createEscrowStatus: PropTypes.string,
  signature: PropTypes.string,
  price: PropTypes.number,
  escrowId: PropTypes.string,
  txHash: PropTypes.string,
  signing: PropTypes.bool,
  currencyQuantity: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  assetQuantity: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  offer: PropTypes.object,
  nonce: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ])
};

const mapStateToProps = state => {
  const offerId = newBuy.selectors.offerId(state);

  return {
    txHash: escrow.selectors.txHash(state),
    escrowId: escrow.selectors.getCreateEscrowId(state),
    statusContactCode: newBuy.selectors.statusContactCode(state),
    username: newBuy.selectors.username(state),
    ensError: network.selectors.getENSError(state),
    createEscrowStatus: escrow.selectors.getCreateEscrowStatus(state),
    signature: metadata.selectors.getSignature(state),
    price: newBuy.selectors.price(state),
    offer: metadata.selectors.getOfferById(state, offerId),
    nonce: metadata.selectors.getNonce(state),
    assetQuantity: newBuy.selectors.assetQuantity(state),
    currencyQuantity: newBuy.selectors.currencyQuantity(state),
    signing: metadata.selectors.isSigning(state),
    offerId
  };
};

export default connect(
  mapStateToProps,
  {
    createEscrow: escrow.actions.createEscrow,
    resetCreateStatus: escrow.actions.resetCreateStatus,
    resetNewBuy: newBuy.actions.resetNewBuy
  }
)(withRouter(withNamespaces()(ConfirmTrade)));
