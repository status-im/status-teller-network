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
import PriceWarning from "../../../../components/PriceWarning";
import upvoteImg from "../../../../../images/upvote.svg";
import downvoteImg from "../../../../../images/downvote.svg";
import arbitratorImg from "../../../../../images/arbitrator.svg";
import disputeImg from "../../../../../images/dispute.svg";
import questionIcon from "../../../../../images/question-mark.svg";
import {formatArbitratorName, renderContactDetails} from '../../../../utils/strings';
import { zeroAddress, addressCompare } from '../../../../utils/address';
import infoRedIcon from "../../../../../images/info-red.svg";

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

// eslint-disable-next-line complexity
  render() {
    const {
      seller, minToken, maxToken, currency, asset, lastActivity, limitless, tokens, assetAddress,
      assetQuantity, currencyQuantity, onCurrencyChange, onAssetChange, disabled, t, notEnoughETH, canRelay,
      limitU, limitL, sellerBalance, price, arbitrator, sellerAddress, arbitratorAddress, address, margin, currentPrice
    } = this.props;

    const minFiat = (parseFloat(limitL) / 100).toFixed(2);
    const maxFiat = (parseFloat(limitU) / 100).toFixed(2);
    const amountGreaterThanBalance = parseFloat(assetQuantity) > parseFloat(sellerBalance);
    const isETH = addressCompare(assetAddress, zeroAddress);
    const isETHorSNT = (isETH || addressCompare(assetAddress, tokens.SNT.address));
    const limitlessMaxFiat = (maxToken * price).toFixed(8);
    const isArbitrator = addressCompare(arbitratorAddress, address);
    const isOwner = addressCompare(seller.address, address);

    return <Fragment>
      <Row noGutters className="offerTrade">
        <Col xs="12">
          <h3 className="mt-4 font-weight-normal">{t('general.seller')}</h3>
          <div className="row d-flex flex-wrap align-items-center m-0">
            <Identicon seed={sellerAddress} className="rounded-circle border mr-2" scale={7}/>
            <p className="font-weight-medium mb-1 name">{seller.username}</p>
          </div>
          {renderContactDetails(t, seller.contactData, sellerAddress, 'mb-0 seller-info')}
          <p className="reputation">{seller.nbReleasedTrades} <span
            className="text-muted mr-2">{t('general.trades')}</span> <img src={upvoteImg} className="mr-2"
                                                                          alt="Upvote"/>{seller.upCount} <img
            src={downvoteImg} className="mr-2 ml-3" alt="Downvote"/>{seller.downCount}</p>

          <h3 className="mt-4 font-weight-normal">{t('general.arbitrator')} <span onClick={this.toggleArbitratorDialog}
                                                                                  className="clickable"><RoundedIcon
            image={questionIcon} bgColor="blue" size="sm" className="d-inline info-btn"/></span></h3>
          <div className="mt-2 font-weight-medium mb-1 overflow-hidden">
            <div className="row d-flex flex-wrap align-items-center m-0">
              <Identicon seed={arbitratorAddress} className="rounded-circle border mr-1 float-left" scale={5}/>
              {formatArbitratorName(arbitrator, arbitratorAddress)}
            </div>
            {renderContactDetails(t, arbitrator.contactData, arbitratorAddress, 'mb-0 arbitrator-info')}
          </div>
          {(isArbitrator || isOwner) && <p className="text-danger text-small m-0">
            {isArbitrator && t('offer.isArbitrator')}
            {isOwner && t('offer.isOwner')}
            <RoundedIcon className="d-inline-block ml-2" image={infoRedIcon} bgColor="red" size="sm"/>
          </p>}

          <h3 className="font-weight-normal mt-4">{t('escrow.detail.price')}</h3>
          <p className="mt-2 font-weight-medium mb-1">
            1 {asset} = {price.toFixed(4)} {currency.id}
          </p>

          {!price && <p className="text-danger">{t('buyer.offerTrade.noPrice')}</p>}
          
          <PriceWarning
                currentPrice={currentPrice}
                fiatAmount={price}
                fiatSymbol={currency.id}
                margin={margin}
                tokenAmount={1}
                tokenSymbol={asset}
              />
        </Col>
        {!isArbitrator && !isOwner && <Col xs="12" className="mt-4">
          <h3>{t('escrow.detail.amount')}</h3>
          <Form className="text-center" onSubmit={(e) => e.preventDefault()}>
            <FormGroup>
              <Row>
                <Col xs={12} sm={12}>
                  <Input type="text" name="fiat" className="form-control" value={currencyQuantity}
                         disabled={!price}
                         data-maxvalue={limitless ? limitlessMaxFiat : maxFiat}
                         data-minvalue={limitless ? 0 : minFiat}
                         validations={[isNumber, lowerEqThan, limitless ? higherThan : higherEqThan]}
                         id="fiat-quantity-input"
                         placeholder={t('buyer.offerTrade.fiatQuantity')}
                         onChange={(e) => onCurrencyChange(e.target.value)} step="any"/>
                  <span className="input-icon mr-3">{currency.id}</span>
                </Col>
              </Row>
            </FormGroup>
            <FormGroup>
              <Row>
                <Col xs={12} sm={12}>
                  <Input type="text"
                         name="asset" className="form-control" value={assetQuantity} id="asset-quantity-input"
                         disabled={!price}
                         data-maxvalue={parseFloat(maxToken) || ''}
                         data-minvalue={parseFloat(minToken) || ''}
                         validations={[isNumber, lowerEqThan, higherEqThan]}
                         placeholder={t('buyer.offerTrade.assetQuantity')}
                         onChange={(e) => onAssetChange(e.target.value)} step="any"/>
                  <span className="input-icon mr-3">{asset}</span>
                </Col>
              </Row>
            </FormGroup>
            {limitless && <p className="mt-3 limits">
              <Trans
                i18nKey="buyer.offerTrade.limits"
                values={{
                  min: limitDecimals(minToken),
                  max: limitDecimals(maxToken),
                  symbol: asset
                }}
              >
                Limits: {{min: limitDecimals(minToken)}} {{symbol: asset}} to <span
                id="max-token">{{max: limitDecimals(maxToken)}} {{symbol: asset}}</span>
              </Trans>
              <UncontrolledTooltip placement="right" target="max-token">
                {t('buyer.offerTrade.sellerBalance')}
              </UncontrolledTooltip>
            </p>}
            {!limitless && <Fragment>
              {amountGreaterThanBalance &&
              <FormFeedback className="d-block">{t('buyer.offerTrade.amountWarning')}</FormFeedback>}
              <p className="mt-3 limits">
                <Trans
                  i18nKey="buyer.offerTrade.limits"
                  values={{
                    min: limitDecimals(minFiat),
                    max: limitDecimals(maxFiat),
                    symbol: currency.id
                  }}>
                  Limits: {{min: limitDecimals(minFiat)}} {{symbol: currency.id}} to <span
                  id="max-token">{{max: limitDecimals(maxToken)}} {{symbol: currency.id}}</span>
                </Trans>
              </p>
            </Fragment>
            }
            {disabled && <p className="text-muted">{t('buyer.offerTrade.enterBefore')}</p>}
            {notEnoughETH && !canRelay && isETHorSNT && <Col xs="12" className="text-small text-center text-danger">
              {t('buyer.offerTrade.newOrderDelay', {time: moment(escrow.helpers.nextRelayDate(lastActivity)).toNow(true)})}
            </Col>}
          </Form>
        </Col> }
      </Row>
      <ModalDialog display={this.state.displayDialogArbitrator} onClose={this.toggleArbitratorDialog}
                   buttonText={t('buyer.offerTrade.dialogButton')}>
        <RoundedIcon image={arbitratorImg} className="mb-2" bgColor="blue"/>
        <h2>{t('general.arbitrator')}</h2>
        <Trans i18nKey="buyer.offerTrade.arbitratorInfo">
          <p className="text-muted">You can think of an arbitrator as a neutral <span
            className="text-black">judge</span> who, when the trade comes to the <span className="clickable text-black"
                                                                                       onClick={this.toggleDisputeDialog}>dispute</span>,
            will review the trade and resolve the dispute.</p>
        </Trans>
      </ModalDialog>
      <ModalDialog display={this.state.displayDisputeDialog} onClose={this.toggleDisputeDialog}
                   buttonText={t('buyer.offerTrade.dialogButton')}>
        <RoundedIcon image={disputeImg} className="mb-2" bgColor="blue"/>
        <h2>{t('buyer.offerTrade.dispute')}</h2>
        <p className="text-muted">{t('buyer.offerTrade.disputeInfo')}</p>
      </ModalDialog>

    </Fragment>;
  }
}

OfferTrade.propTypes = {
  t: PropTypes.func,
  address: PropTypes.string,
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
  assetAddress: PropTypes.string,
  sellerBalance: PropTypes.string,
  onCurrencyChange: PropTypes.func,
  onAssetChange: PropTypes.func,
  disabled: PropTypes.bool,
  notEnoughETH: PropTypes.bool,
  canRelay: PropTypes.bool,
  lastActivity: PropTypes.number,
  limitless: PropTypes.bool,
  limitL: PropTypes.string,
  limitU: PropTypes.string,
  arbitrator: PropTypes.object,
  sellerAddress: PropTypes.string,
  sellerContactData: PropTypes.string,
  arbitratorAddress: PropTypes.string,
  arbitratorContactData: PropTypes.string,
  tokens: PropTypes.object
};

export default withTranslation()(OfferTrade);
