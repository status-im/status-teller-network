import React, {Fragment} from 'react';
import {Row, Col} from 'reactstrap';
import PropTypes from 'prop-types';
import moment from "moment";
import Identicon from "../../../components/UserInformation/Identicon";
import {formatArbitratorName, renderContactData} from '../../../utils/strings';
import {PAYMENT_METHODS} from '../../../features/metadata/constants';
import PriceWarning from '../../../components/PriceWarning';
import {withTranslation} from "react-i18next";
import EscrowProxy from '../../../../embarkArtifacts/contracts/EscrowProxy';

const EscrowDetail = ({t, escrow, currentPrice, isBuyer}) => {
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

      <h3 className="font-weight-normal mt-4">{t('escrow.detail.contract')}</h3>
      <p className="font-weight-medium mb-0">
        {EscrowProxy.options.address}
      </p>
      <span className="mb-1">
        <a href={"https://etherscan.io/address/" + EscrowProxy.options.address} target="_blank" rel="noopener noreferrer">{t('escrow.detail.viewEtherscan')} →</a>
      </span>

      <h3 className="font-weight-normal mt-4">{t('escrow.detail.escrowID')}</h3>
      <p className="font-weight-medium mb-1">
        {escrow.escrowId}
      </p>

    {isBuyer && <Fragment>
      <h3 className="mt-4 font-weight-normal">{t('general.seller')}</h3>
      <p className="mt-2 font-weight-medium mb-1">
        <Identicon seed={escrow.offer.owner} className="rounded-circle border mr-2 float-left" scale={5}/>
        {escrow.seller.username}
      </p>
      {renderContactData(escrow.seller.contactData)}
    </Fragment>}

    {!isBuyer && <Fragment>
      <h3 className="mt-4 font-weight-normal">{t('general.buyer')}</h3>
      <p className="mt-2 font-weight-medium mb-1">
        <Identicon seed={escrow.buyer} className="rounded-circle border mr-2 float-left" scale={5}/>
        {escrow.buyerInfo.username}
      </p>
      {renderContactData(escrow.buyerInfo.contactData)}
    </Fragment>}

      {escrow.arbitratorInfo && <Fragment>
        <h3 className="mt-4 font-weight-normal">{t('general.arbitrator')}</h3>
        <p className="mt-2 font-weight-medium mb-1">
          <Identicon seed={escrow.arbitrator} className="rounded-circle border mr-2 float-left" scale={5}/>
          {formatArbitratorName(escrow.arbitratorInfo, escrow.arbitrator)}
        </p>
        {renderContactData(escrow.arbitratorInfo.contactData)}
      </Fragment>
      }

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
  escrow: PropTypes.object,
  currentPrice: PropTypes.object,
  isBuyer: PropTypes.bool
};

export default withTranslation()(EscrowDetail);
