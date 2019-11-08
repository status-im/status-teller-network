import React, {Fragment} from 'react';
import {Row, Col} from 'reactstrap';
import PropTypes from 'prop-types';
import moment from "moment";
import Identicon from "../../../components/UserInformation/Identicon";
import Address from "../../../components/UserInformation/Address";
import { formatArbitratorName } from '../../../utils/strings';
import {PAYMENT_METHODS} from '../../../features/metadata/constants';
import PriceWarning from '../../../components/PriceWarning';

const EscrowDetail = ({escrow, currentPrice, isBuyer}) => {
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
          <Identicon seed={escrow.seller.statusContactCode} className="rounded-circle border mr-2 float-left" scale={5}/>
          {escrow.seller.username}
        </p>
        <p className="text-muted text-small addr"><Address address={escrow.seller.statusContactCode} length={6}/></p>
      </Fragment>}

      {!isBuyer && <Fragment>
        <h3 className="mt-4 font-weight-normal">Buyer</h3>
        <p className="mt-2 font-weight-medium mb-1">
          <Identicon seed={escrow.buyerInfo.statusContactCode} className="rounded-circle border mr-2 float-left" scale={5}/>
          {escrow.buyerInfo.username}
        </p>
        <p className="text-muted text-small addr"><Address address={escrow.buyerInfo.statusContactCode} length={6}/></p>
      </Fragment>}

      {escrow.arbitratorInfo && <Fragment>
        <h3 className="mt-4 font-weight-normal">Arbitrator</h3>
        <p className="mt-2 font-weight-medium mb-1">
          <Identicon seed={escrow.arbitratorInfo.statusContactCode} className="rounded-circle border mr-2 float-left" scale={5}/>
          {formatArbitratorName(escrow.arbitratorInfo, escrow.offer.arbitrator)}
        </p>
        <p className="text-muted text-small addr"><Address address={escrow.arbitratorInfo.statusContactCode} length={6}/></p>
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
