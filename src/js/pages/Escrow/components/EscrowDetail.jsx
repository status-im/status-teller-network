import React, {Fragment} from 'react';
import {Row, Col} from 'reactstrap';
import PropTypes from 'prop-types';
import moment from "moment";
import Identicon from "../../../components/UserInformation/Identicon";
import {formatArbitratorName, renderContactData} from '../../../utils/strings';
import {PAYMENT_METHODS} from '../../../features/metadata/constants';
import PriceWarning from '../../../components/PriceWarning';

const EscrowDetail = ({escrow, currentPrice, isBuyer}) => {
  if(!escrow.seller || !escrow.buyerInfo || !escrow.arbitratorInfo) return null;

  const escrowAssetPrice = (escrow.fiatAmount / 100) / escrow.tokenAmount;

  return <div className="escrowDetails">
      <h2 className="mt-5">Trade Details</h2>
      <h3 className="font-weight-normal mt-4">Trade Amount</h3>
      <p className="font-weight-medium mb-1">
        {(escrow.fiatAmount / 100).toFixed(2)} {escrow.offer.currency} for {escrow.tokenAmount} {escrow.token.symbol}
      </p>

      <h3 className="font-weight-normal mt-4">Price</h3>
      <p className="font-weight-medium mb-1">
        1 {escrow.token.symbol} = {escrowAssetPrice.toFixed(4)} {escrow.offer.currency}
      </p>

      <h3 className="font-weight-normal mt-4">Payment Method</h3>
      <p className="font-weight-medium mb-1">
        {
          escrow.offer.paymentMethods.map(x => PAYMENT_METHODS[x]).join(', ')
        }
      </p>

      <h3 className="font-weight-normal mt-4">Trade Location</h3>
      <p className="font-weight-medium mb-1">
        {escrow.seller.location}
      </p>

    {isBuyer && <Fragment>
      <h3 className="mt-4 font-weight-normal">Seller</h3>
      <p className="mt-2 font-weight-medium mb-1">
        <Identicon seed={escrow.offer.owner} className="rounded-circle border mr-2 float-left" scale={5}/>
        {escrow.seller.username}
      </p>
      {renderContactData(escrow.seller.contactData)}
    </Fragment>}

    {!isBuyer && <Fragment>
      <h3 className="mt-4 font-weight-normal">Buyer</h3>
      <p className="mt-2 font-weight-medium mb-1">
        <Identicon seed={escrow.buyer} className="rounded-circle border mr-2 float-left" scale={5}/>
        {escrow.buyerInfo.username}
      </p>
      {renderContactData(escrow.buyerInfo.contactData)}
    </Fragment>}

      {escrow.arbitratorInfo && <Fragment>
        <h3 className="mt-4 font-weight-normal">Arbitrator</h3>
        <p className="mt-2 font-weight-medium mb-1">
          <Identicon seed={escrow.arbitrator} className="rounded-circle border mr-2 float-left" scale={5}/>
          {formatArbitratorName(escrow.arbitratorInfo, escrow.arbitrator)}
        </p>
        {renderContactData(escrow.arbitratorInfo.contactData)}
      </Fragment>
      }

    <Row className="mt-4">
      <Col xs="12">
      {escrow.expirationTime && escrow.expirationTime !== '0' && <p className="text-dark m-0">Expiration time: {moment(escrow.expirationTime * 1000).calendar()}</p>}

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
  escrow: PropTypes.object,
  currentPrice: PropTypes.object,
  isBuyer: PropTypes.bool
};

export default EscrowDetail;
