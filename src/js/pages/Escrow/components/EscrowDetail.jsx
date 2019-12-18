import React, {Fragment} from 'react';
import {Row, Col, Button} from 'reactstrap';
import PropTypes from 'prop-types';
import moment from "moment";
import Identicon from "../../../components/UserInformation/Identicon";
import {formatArbitratorName, renderContactData,stringToContact} from '../../../utils/strings';
import {PAYMENT_METHODS} from '../../../features/metadata/constants';
import PriceWarning from '../../../components/PriceWarning';
import Address from '../../../components/UserInformation/Address';
import {withTranslation} from "react-i18next";

const EscrowDetail = ({t, escrow, currentPrice, isBuyer, arbitrationDetails, onClickChat}) => {
  if(!escrow.seller || !escrow.buyerInfo || !escrow.arbitratorInfo) return null;

  const escrowAssetPrice = (escrow.fiatAmount / 100) / escrow.tokenAmount;

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

    {isBuyer && <Fragment>
      <h3 className="mt-4 font-weight-normal">{t('general.seller')}</h3>
      <Row noGutters>
        <Col xs={9}>
          <div className="mt-2 font-weight-medium">
            <Identicon seed={escrow.offer.owner} className="rounded-circle border mr-2 float-left mb-5" scale={5}/>
            {escrow.seller.username}
            {renderContactData(escrow.seller.contactData, 'mb-0')}
            <p className="text-muted text-small addr m-0">
              {t('general.address')}: <Address disableHover address={escrow.offer.owner} length={6}/>
            </p>
          </div>
        </Col>
        <Col xs={3} className="pt-3">
          <Button color="primary" size="sm" onClick={onClickChat(isBuyer ? 'seller' : 'buyer')}>
            {t('escrow.openChat.chat')}
          </Button>
        </Col>
      </Row>
    </Fragment>}

    {!isBuyer && <Fragment>
      <h3 className="mt-4 font-weight-normal">{t('general.buyer')}</h3>
      <Row noGutters>
        <Col xs={9}>
          <div className="mt-2 font-weight-medium">
            <Identicon seed={escrow.buyer} className="rounded-circle border mr-2 float-left mb-5" scale={5}/>
            {escrow.buyerInfo.username}
            {renderContactData(escrow.buyerInfo.contactData, 'mb-0')}
            <p className="text-muted text-small addr m-0">
              {t('general.address')}: <Address disableHover address={escrow.buyer} length={6}/>
            </p>
          </div>
        </Col>
        <Col xs={3} className="pt-3">
          <Button color="primary" size="sm" onClick={onClickChat(isBuyer ? 'seller' : 'buyer')}>
            {t('escrow.openChat.chat')}
          </Button>
        </Col>
      </Row>
    </Fragment>}

    {escrow.arbitratorInfo && <Fragment>
      <h3 className="font-weight-normal">{t('general.arbitrator')}</h3>
      <Row noGutters>
        <Col xs={9}>
          <div className="mt-2 font-weight-medium">
            <Identicon seed={escrow.arbitrator} className="rounded-circle border mr-2 float-left mb-5" scale={5}/>
            {formatArbitratorName(escrow.arbitratorInfo, escrow.arbitrator)}
            {arbitrationDetails.open && renderContactData(escrow.arbitratorInfo.contactData, 'mb-0') }
            {!arbitrationDetails.open && <p className="text-muted text-small m-0">{t('general.contactMethod')}: {stringToContact(escrow.arbitratorInfo.contactData).method}</p> }
            <p className="text-muted text-small addr m-0">
              {t('general.address')}: <Address disableHover address={escrow.arbitrator} length={6}/>
            </p>
          </div>
        </Col>
        <Col xs={3}>
          <Button color={arbitrationDetails.open ? 'primary': 'secondary'} disabled={!arbitrationDetails.open} size="sm" onClick={onClickChat('arbitrator')}>
            {t('escrow.openChat.chat')}
          </Button>
        </Col>
      </Row>
    </Fragment>}

    <Row className="mt-4">
      <Col xs="12">
      {escrow.expirationTime && escrow.expirationTime !== '0' && <p className="text-dark m-0">{t('escrow.detail.expirationTime')} {moment(escrow.expirationTime * 1000).calendar()}</p>}

      <PriceWarning
        currentPrice={(currentPrice && currentPrice[escrow.offer.currency]) || '0.00'}
        escrowStatus={escrow.status}
        fiatAmount={escrow.fiatAmount}
        fiatSymbol={escrow.offer.currency}
        isBuyer={isBuyer}
        margin={escrow.offer.margin}
        tokenAmount={escrow.tokenAmount}
        tokenSymbol={escrow.token.symbol}
      />

      </Col>
  </Row>
  </div>;
};


EscrowDetail.propTypes = {
  t: PropTypes.func,
  arbitrationDetails: PropTypes.object,
  escrow: PropTypes.object,
  currentPrice: PropTypes.object,
  isBuyer: PropTypes.bool,
  onClickChat: PropTypes.func
};

export default withTranslation()(EscrowDetail);
