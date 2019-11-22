import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {withNamespaces} from "react-i18next";
import {Row, Col, FormGroup, UncontrolledTooltip, FormFeedback} from 'reactstrap';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import {isNumber, lowerEqThan, higherEqThan, higherThan} from "../../../../validators";
import {limitDecimals} from '../../../../utils/numbers';
import moment from "moment";
import escrow from "../../../../features/escrow";
import RoundedIcon from "../../../../ui/RoundedIcon";
import ModalDialog from "../../../../components/ModalDialog";
import Address from "../../../../components/UserInformation/Address";
import Identicon from "../../../../components/UserInformation/Identicon";
import infoIcon from "../../../../../images/small-info.svg";
import upvoteImg from "../../../../../images/upvote.svg";
import downvoteImg from "../../../../../images/downvote.svg";
import arbitratorImg from "../../../../../images/arbitrator.svg";
import disputeImg from "../../../../../images/dispute.svg";
import questionIcon from "../../../../../images/question-mark.svg";


import './index.scss';

class OfferTrade extends Component {

  state = {
    displayDialogArbitrator: false,
    displayDisputeDialog: false
  }

  toggleArbitratorDialog = (e) => {
    e.preventDefault();
    this.setState((oldState) => ({
      displayDialogArbitrator: !oldState.displayDialogArbitrator,
      displayDisputeDialog: false
    }));
    return false;
  }

  toggleDisputeDialog = (e) => {
    e.preventDefault();
    this.setState((oldState) => ({
      displayDisputeDialog: !oldState.displayDisputeDialog
    }));
    return false;
  }

  render() {
    const {
      seller, minToken, maxToken, currency, asset, lastActivity, limitless,
      assetQuantity, currencyQuantity, onCurrencyChange, onAssetChange, disabled, t, notEnoughETH, canRelay,
      limitH, limitL, sellerBalance, price, arbitrator, sellerAddress, arbitratorAddress
    } = this.props;

    const minFiat = (parseFloat(limitL) / 100).toFixed(2);
    const maxFiat = (parseFloat(limitH) / 100).toFixed(2);
    const amountGreaterThanBalance = parseFloat(assetQuantity) > parseFloat(sellerBalance);

    return <Fragment>
  <Row noGutters className="offerTrade">
    <Col xs="12">
      <h3 className="mt-4 font-weight-normal">Seller</h3>
      <Identicon seed={sellerAddress} className="rounded-circle border mr-2" scale={7}/>
      <p className="font-weight-medium mb-1 name">{seller.username}</p>
      <p className="text-muted text-small addr mb-0"><Address address={sellerAddress} length={13}/></p>
      <p className="reputation">{seller.nbReleasedTrades} <span className="text-muted mr-4">Trades</span> <img src={upvoteImg} className="mr-2" alt="Upvote"/>{seller.upCount} <img src={downvoteImg} className="mr-2 ml-3"  alt="Downvote"/>{seller.downCount}</p>

      <h3 className="mt-4 font-weight-normal">Arbitrator <span onClick={this.toggleArbitratorDialog} className="clickable"><RoundedIcon image={questionIcon} bgColor="blue" size="sm" className="d-inline"/></span></h3>
      <p className="mt-2 font-weight-medium mb-1 overflow-hidden">
        <Identicon seed={arbitratorAddress} className="rounded-circle border mr-2 float-left" scale={5}/>
        {arbitrator.username}
      </p>
      <p className="text-muted text-small addr"><Address address={arbitratorAddress} length={13}/></p>


      <h3 className="font-weight-normal mt-4">Price</h3>
      <p className="mt-2 font-weight-medium mb-1">
        1 {asset} = {price.toFixed(4)} {currency.id}
      </p>
      <p className="text-muted text-small mt-2">
        <Row tag="span">
          <Col tag="span" xs={1}><RoundedIcon image={infoIcon} bgColor="secondary" className="float-left" size="sm"/></Col>
          <Col tag="span" x2={11} className="pt-1">Only continue if you are comfortable with this price</Col>
        </Row>
      </p>
    </Col>
    <Col xs="12" className="mt-4">
      <h3>Trade Amount</h3>
      <Form className="text-center">
        <FormGroup>
          <Row>
            <Col xs={12} sm={12}>
              <Input type="text"
                     name="asset" className="form-control" value={assetQuantity} id="asset-quantity-input"
                     data-maxvalue={parseFloat(maxToken) || ''}
                     data-minvalue={parseFloat(minToken) || ''}
                     validations={[isNumber, lowerEqThan, higherEqThan]}
                     placeholder="Asset quantity" onChange={(e) => onAssetChange(e.target.value)} step="any"/>
              <span className="input-icon mr-3">{asset}</span>
            </Col>
          </Row>
        </FormGroup>
        <FormGroup>
          <Row>
            <Col xs={12} sm={12}>
              <Input type="text" name="fiat" className="form-control" value={currencyQuantity}
                     data-maxvalue={limitless ? '' : maxFiat}
                     data-minvalue={0}
                     validations={[isNumber, lowerEqThan, higherThan]}
                     id="fiat-quantity-input"
                     placeholder="Fiat quantity" onChange={(e) => onCurrencyChange(e.target.value)} step="any"/>
              <span className="input-icon mr-3">{currency.id}</span>
            </Col>
          </Row>
        </FormGroup>
        { limitless && <p className="mt-3 limits">
        Limits: {limitDecimals(minToken)} {asset} to <span id="max-token">{limitDecimals(maxToken)} {asset}</span>
        <UncontrolledTooltip placement="right" target="max-token">
          This is the current balance of the seller. This is why it is the maximum
        </UncontrolledTooltip>
        </p> }
        { !limitless && <Fragment>
            { amountGreaterThanBalance && <FormFeedback className="d-block">Amount is greater than the seller&apos;s balance</FormFeedback> }
            <p className="mt-3 limits">Limits: {limitDecimals(minFiat)} {currency.id} to <span id="max-token">{limitDecimals(maxFiat)} {currency.id}</span></p>
          </Fragment>
        }
        {disabled && <p className="text-muted">{t('buyer.offerTrade.enterBefore')}</p>}
        {notEnoughETH && !canRelay && <Col xs="12" className="text-small text-center text-danger">
              New orders can be created in {moment(escrow.helpers.nextRelayDate(lastActivity)).toNow(true)}
        </Col>}
      </Form>
    </Col>
  </Row>
  <ModalDialog display={this.state.displayDialogArbitrator} onClose={this.toggleArbitratorDialog} buttonText="Ok got it">
    <RoundedIcon image={arbitratorImg} className="mb-2" bgColor="blue" />
    <h2>Arbitrator</h2>
    <p className="text-muted">You can think of an arbitrator as a neutral <span className="text-black">judge</span> who, when the trade comes to the <span className="clickable" onClick={this.toggleDisputeDialog}>dispute</span>, will review the trade and resolve the dispute.</p>
  </ModalDialog>
  <ModalDialog display={this.state.displayDisputeDialog} onClose={this.toggleDisputeDialog} buttonText="Ok got it">
    <RoundedIcon image={disputeImg} className="mb-2" bgColor="blue" />
    <h2>Dispute</h2>
    <p className="text-muted">A dispute is a disagreement on a point of law or fact, a conflict of legal views or of interests between two persons.</p>
  </ModalDialog>

  </Fragment>;
  }
}

OfferTrade.propTypes = {
  t: PropTypes.func,
  seller: PropTypes.object,
  currency: PropTypes.object,
  minToken: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  maxToken: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  asset: PropTypes.string,
  price: PropTypes.number,
  assetQuantity: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  currencyQuantity: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  sellerBalance: PropTypes.string,
  onCurrencyChange: PropTypes.func,
  onAssetChange: PropTypes.func,
  disabled: PropTypes.bool,
  notEnoughETH: PropTypes.bool,
  canRelay: PropTypes.bool,
  lastActivity: PropTypes.number,
  limitless: PropTypes.bool,
  limitL: PropTypes.string,
  limitH: PropTypes.string,
  arbitrator: PropTypes.object,
  sellerAddress: PropTypes.string,
  arbitratorAddress: PropTypes.string
};

export default withNamespaces()(OfferTrade);
