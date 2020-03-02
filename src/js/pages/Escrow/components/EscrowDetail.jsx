/* eslint-disable complexity */
import React, {Fragment} from 'react';
import {Row, Col, Button} from 'reactstrap';
import PropTypes from 'prop-types';
import moment from "moment";
import Identicon from "../../../components/UserInformation/Identicon";
import {formatArbitratorName, renderContactData, stringToContact} from '../../../utils/strings';
import {PAYMENT_METHODS} from '../../../features/metadata/constants';
import PriceWarning from '../../../components/PriceWarning';
import Address from '../../../components/UserInformation/Address';
import {withTranslation} from "react-i18next";
import EscrowInstance from '../../../../embarkArtifacts/contracts/EscrowInstance';
import {tradeStates} from "../../../features/escrow/helpers";
import classnames from 'classnames';
import RoundedIcon from "../../../ui/RoundedIcon";
import infoRedIcon from "../../../../images/info-red.svg";
import greenCheckIcon from "../../../../images/green-check.svg";

const EscrowDetail = ({t, escrow, currentPrice, isBuyer, arbitrationDetails, onClickChat, isStatus, arbitratorScore, arbitrationExpired}) => {
  if (!escrow.seller || !escrow.buyerInfo || !escrow.arbitratorInfo) return null;

  const escrowAssetPrice = (escrow.fiatAmount / 100) / escrow.tokenAmount;
  const otherUserInfo = isBuyer ? escrow.seller : escrow.buyerInfo;
  const otherUserContactObj = stringToContact(otherUserInfo.contactData);

  return <div className="escrowDetails">
    <h2 className="mt-5">{t('escrow.detail.title')}</h2>
    <h3 className="font-weight-normal mt-4">{t('escrow.detail.amount')}</h3>
    <p className="font-weight-medium mb-1">
      {(escrow.fiatAmount / 100).toFixed(2)} {escrow.offer.currency} {t('escrow.detail.for')} {escrow.tokenAmount} {escrow.token.symbol}
    </p>

    <h3 className="font-weight-normal mt-4">{t('escrow.detail.price')}</h3>
    <p className="font-weight-medium mb-1">
      1 {escrow.token.symbol} = {escrowAssetPrice.toFixed(4)} {escrow.offer.currency}
    </p>

    <h3 className="font-weight-normal mt-4">{t('escrow.detail.paymentMethods')}</h3>
    <p className="font-weight-medium mb-1">
      {
        escrow.offer.paymentMethods.map(x => PAYMENT_METHODS[x]).join(', ')
      }
    </p>

    <h3 className="font-weight-normal mt-4">{t('escrow.detail.location')}</h3>
    <p className="font-weight-medium mb-1">
      {escrow.seller.location}
    </p>

    <h3 className="font-weight-normal mt-4">{t('escrow.detail.contract')}</h3>
    <p className="font-weight-medium mb-0 text-break">
      {EscrowInstance.options.address}
    </p>
    <span className="mb-1">
        <a href={"https://etherscan.io/address/" + EscrowInstance.options.address} target="_blank"
           rel="noopener noreferrer">{t('escrow.detail.viewEtherscan')} →</a>
      </span>

    <h3 className="font-weight-normal mt-4">{t('escrow.detail.escrowID')}</h3>
    <p className="font-weight-medium mb-1">
      {escrow.escrowId}
    </p>

    <Fragment>
      <h3 className="mt-4 font-weight-normal">{isBuyer ? t('general.seller') : t('general.buyer')}</h3>
      <Row noGutters>
        <Col xs={9}>
          <div className="mt-2 font-weight-medium">
            <Identicon seed={isBuyer ? escrow.offer.owner : escrow.buyer}
                       className="rounded-circle border mr-2 float-left mb-5" scale={5}/>
            {otherUserInfo.username}
            {renderContactData(otherUserInfo.contactData, 'mb-0')}
            <p className="text-muted text-small addr m-0">
              {t('general.address')}: <Address disableHover address={isBuyer ? escrow.offer.owner : escrow.buyer}
                                               length={6}/>
            </p>
          </div>
        </Col>
        <Col xs={3} className="pt-3">
          {isStatus && otherUserContactObj.method === 'Status' &&
          <a href={"https://get.status.im/user/" + otherUserContactObj.userId}
             rel="noopener noreferrer" target="_blank" className="btn btn-primary btn-sm">
            {t('escrow.openChat.chat')}
          </a>}
          {(!isStatus || otherUserContactObj.method !== 'Status') &&
          <Button color="primary" size="sm" onClick={onClickChat(isBuyer ? 'seller' : 'buyer')}>
            {t('escrow.openChat.chat')}
          </Button>}
        </Col>
      </Row>
    </Fragment>

    {escrow.arbitratorInfo && <Fragment>
      <h3 className="font-weight-normal">{t('general.arbitrator')}</h3>
      <Row noGutters className={classnames({translucent: arbitrationExpired})}>
        <Col xs={9}>
          <div className="mt-2 font-weight-medium">
            <Identicon seed={escrow.arbitrator} className="rounded-circle border mr-2 float-left mb-4" scale={5}/>
            {formatArbitratorName(escrow.arbitratorInfo, escrow.arbitrator, arbitratorScore)}
            {arbitrationDetails.open && renderContactData(escrow.arbitratorInfo.contactData, 'mb-0')}
            {!arbitrationDetails.open && <p
              className="text-muted text-small m-0">{t('general.contactMethod')}: {stringToContact(escrow.arbitratorInfo.contactData).method}</p>}
            <p className="text-muted text-small addr m-0">
              {t('general.address')}: <Address disableHover address={escrow.arbitrator} length={6}/>
            </p>
          </div>
        </Col>
        <Col xs={3}>
          {<Button color={arbitrationDetails.open && !arbitrationExpired ? 'primary' : 'secondary'}
                   disabled={!arbitrationDetails.open || arbitrationExpired} size="sm"
                   onClick={onClickChat('arbitrator')}>
            {t('escrow.openChat.chat')}
          </Button>}
        </Col>
      </Row>
    </Fragment>}

    {arbitrationExpired && <>
      <p>
        <RoundedIcon bgColor="red" image={infoRedIcon} size="md" className="float-left mr-2"/>
        <span className="text-danger">{t('escrow.dispute.dontCommunicate')}</span>
      </p>
      {arbitrationDetails.open && <p>
        <RoundedIcon bgColor="green" image={greenCheckIcon} size="md" className="float-left mr-2"/>
        <span className="text-muted">{t('escrow.dispute.waitForFallback')}</span>
      </p>}
    </>}

    {isBuyer && escrow.status === tradeStates.funded && escrow.expirationTime && escrow.expirationTime !== '0' &&
    <p className="text-dark mb-0 mt-4">
      {t('escrow.detail.expirationTime')} {moment(escrow.expirationTime * 1000).calendar()}
    </p>}

    <PriceWarning
      currentPrice={(currentPrice && currentPrice[escrow.offer.currency]) || '0.00'}
      escrowStatus={escrow.status}
      fiatAmount={escrow.fiatAmount}
      fiatSymbol={escrow.offer.currency}
      isBuyer={isBuyer}
      margin={escrow.offer.margin}
      tokenAmount={escrow.tokenAmount}
      tokenSymbol={escrow.token.symbol}
      hideDefaultText
    />
  </div>;
};


EscrowDetail.propTypes = {
  t: PropTypes.func,
  fallbackArbitrator: PropTypes.string,
  arbitrationDetails: PropTypes.object,
  arbitrationExpired: PropTypes.bool,
  escrow: PropTypes.object,
  currentPrice: PropTypes.object,
  isBuyer: PropTypes.bool,
  isStatus: PropTypes.bool,
  onClickChat: PropTypes.func,
  arbitratorScore: PropTypes.number
};

export default withTranslation()(EscrowDetail);
