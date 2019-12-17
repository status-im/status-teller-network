import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {withTranslation, Trans} from "react-i18next";
import {Row, Col, FormGroup, UncontrolledTooltip, FormFeedback} from 'reactstrap';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import {isNumber, lowerEqThan, higherEqThan, higherThan} from "../../../../validators";
import {limitDecimals} from '../../../../utils/numbers';
import moment from "moment";
import escrow from "../../../../features/escrow";
import RoundedIcon from "../../../../ui/RoundedIcon";
import ModalDialog from "../../../../components/ModalDialog";
import Identicon from "../../../../components/UserInformation/Identicon";
import infoIcon from "../../../../../images/small-info.svg";
import upvoteImg from "../../../../../images/upvote.svg";
import downvoteImg from "../../../../../images/downvote.svg";
import arbitratorImg from "../../../../../images/arbitrator.svg";
import disputeImg from "../../../../../images/dispute.svg";
import questionIcon from "../../../../../images/question-mark.svg";
import {formatArbitratorName, renderContactDetails} from '../../../../utils/strings';

import './index.scss';

class OfferTrade extends Component {

  state = {
    displayDialogArbitrator: false,
    displayDisputeDialog: false
  };

  toggleArbitratorDialog = (e) => {
    e.preventDefault();
    this.setState((oldState) => ({
      displayDialogArbitrator: !oldState.displayDialogArbitrator,
      displayDisputeDialog: false
    }));
    return false;
  };

  toggleDisputeDialog = (e) => {
    e.preventDefault();
    this.setState((oldState) => ({
      displayDisputeDialog: !oldState.displayDisputeDialog
    }));
    return false;
  };

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
      <h3 className="mt-4 font-weight-normal">{t('general.seller')}</h3>
      <div className="row d-flex flex-wrap align-items-center m-0">
        <Identicon seed={sellerAddress} className="rounded-circle border mr-2" scale={7}/>
        <p className="font-weight-medium mb-1 name">{seller.username}</p>
      </div>
      {renderContactDetails(t, seller.contactData, sellerAddress, 'mb-0')}
      <p className="reputation">{seller.nbReleasedTrades} <span className="text-muted mr-2">{t('general.trades')}</span> <img src={upvoteImg} className="mr-2" alt="Upvote"/>{seller.upCount} <img src={downvoteImg} className="mr-2 ml-3"  alt="Downvote"/>{seller.downCount}</p>

      <h3 className="mt-4 font-weight-normal">{t('general.arbitrator')} <span onClick={this.toggleArbitratorDialog} className="clickable"><RoundedIcon image={questionIcon} bgColor="blue" size="sm" className="d-inline info-btn"/></span></h3>
      <div className="mt-2 font-weight-medium mb-1 overflow-hidden">
        <div className="row d-flex flex-wrap align-items-center m-0">
          <Identicon seed={arbitratorAddress} className="rounded-circle border mr-1 float-left" scale={5}/>
          {formatArbitratorName(arbitrator, arbitratorAddress)}
        </div>
        {renderContactDetails(t, arbitrator.contactData, arbitratorAddress, 'mb-0')}
      </div>

      <h3 className="font-weight-normal mt-4">{t('escrow.detail.price')}</h3>
      <p className="mt-2 font-weight-medium mb-1">
        1 {asset} = {price.toFixed(4)} {currency.id}
      </p>
      <p className="text-muted text-small mt-2">
        <RoundedIcon image={infoIcon} bgColor="secondary" className="float-left mr-1" size="sm"/>
        <span className="pt-2">{t('priceWarning.onlyContinueIf')}</span>
      </p>
    </Col>
    <Col xs="12" className="mt-4">
      <h3>{t('escrow.detail.amount')}</h3>
      <Form className="text-center" onSubmit={(e) => e.preventDefault()}>
        <FormGroup>
          <Row>
            <Col xs={12} sm={12}>
              <Input type="text"
                     name="asset" className="form-control" value={assetQuantity} id="asset-quantity-input"
                     data-maxvalue={parseFloat(maxToken) || ''}
                     data-minvalue={parseFloat(minToken) || ''}
                     validations={[isNumber, lowerEqThan, higherEqThan]}
                     placeholder={t('buyer.offerTrade.assetQuantity')} onChange={(e) => onAssetChange(e.target.value)} step="any"/>
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
                     placeholder={t('buyer.offerTrade.fiatQuantity')} onChange={(e) => onCurrencyChange(e.target.value)} step="any"/>
              <span className="input-icon mr-3">{currency.id}</span>
            </Col>
          </Row>
        </FormGroup>
        { limitless && <p className="mt-3 limits">
          <Trans 
            i18nKey="buyer.offerTrade.limits" values={{
            min: limitDecimals(minToken),
            max: limitDecimals(maxToken),
            symbol: asset
          }}>
            Limits: {limitDecimals(minToken)} {asset} to <span id="max-token">{limitDecimals(maxToken)} {asset}</span>
          </Trans>
        <UncontrolledTooltip placement="right" target="max-token">
          {t('buyer.offerTrade.sellerBalance')}
        </UncontrolledTooltip>
        </p> }
        { !limitless && <Fragment>
            { amountGreaterThanBalance && <FormFeedback className="d-block">{t('buyer.offerTrade.amountWarning')}</FormFeedback> }
            <p className="mt-3 limits">
              <Trans 
               i18nKey="buyer.offerTrade.limits" values={{
                min: limitDecimals(minFiat),
                max: limitDecimals(maxFiat),
                symbol: currency.id
              }}>
              Limits: {limitDecimals(minToken)} {asset} to <span id="max-token">{limitDecimals(maxToken)} {asset}</span>
              </Trans>
            </p>  
          </Fragment>
        }
        {disabled && <p className="text-muted">{t('buyer.offerTrade.enterBefore')}</p>}
        {notEnoughETH && !canRelay && <Col xs="12" className="text-small text-center text-danger">
          {t('buyer.offerTrade.newOrderDelay', {time: moment(escrow.helpers.nextRelayDate(lastActivity)).toNow(true)})}
        </Col>}
      </Form>
    </Col>
  </Row>
  <ModalDialog display={this.state.displayDialogArbitrator} onClose={this.toggleArbitratorDialog} buttonText={t('buyer.offerTrade.dialogButton')}>
    <RoundedIcon image={arbitratorImg} className="mb-2" bgColor="blue" />
    <h2>{t('general.arbitrator')}</h2>
    <Trans i18nKey="buyer.offerTrade.arbitratorInfo">
      <p className="text-muted">You can think of an arbitrator as a neutral <span className="text-black">judge</span> who, when the trade comes to the <span className="clickable text-black" onClick={this.toggleDisputeDialog}>dispute</span>, will review the trade and resolve the dispute.</p>
    </Trans>
  </ModalDialog>
  <ModalDialog display={this.state.displayDisputeDialog} onClose={this.toggleDisputeDialog} buttonText={t('buyer.offerTrade.dialogButton')}>
    <RoundedIcon image={disputeImg} className="mb-2" bgColor="blue" />
    <h2>{t('buyer.offerTrade.dispute')}</h2>
    <p className="text-muted">{t('buyer.offerTrade.disputeInfo')}</p>
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
  sellerContactData: PropTypes.string,
  arbitratorAddress: PropTypes.string,
  arbitratorContactData: PropTypes.string
};

export default withTranslation()(OfferTrade);
