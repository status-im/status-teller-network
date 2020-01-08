import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col, Button, UncontrolledTooltip} from 'reactstrap';
import {formatFiatPrice, truncateTwo} from '../../../utils/numbers';
import {getTokenImage} from '../../../utils/images';
import {calculateEscrowPrice} from '../../../utils/transaction';
import classnames from 'classnames';
import NoArbitratorWarning from "../../../components/NoArbitratorWarning";
import {withTranslation} from "react-i18next";

const Offer = ({t, offer, prices, onClick, disabled}) => {
  const isDisabled = disabled || !prices || prices.error;
  return (
    <Row className="border py-2 mx-0 my-2 rounded">
      <Col xs="4" className="v-align-center">
        <p className="font-weight-bold"><img src={getTokenImage(offer.token.symbol)} alt="asset icon" className="mr-2"/>{offer.token.symbol}</p>
      </Col>
      <Col xs="8" className="v-align-center text-right">
        <Button color={disabled ? "secondary" : "primary"}
                className={classnames('p-2', {disabled: isDisabled, 'not-clickable': isDisabled})}
                onClick={isDisabled ? null : onClick} id={`buy-btn-${offer.id}`}>
          {t('offer.buyFor', {price: formatFiatPrice(calculateEscrowPrice(offer, prices)), currency: offer.currency})}
        </Button>
        {disabled && <UncontrolledTooltip placement="top" target={`buy-btn-${offer.id}`}>
          {t('offer.disabledBecauseArbi')}
        </UncontrolledTooltip>}
        {(!prices || prices.error) && <UncontrolledTooltip placement="top" target={`buy-btn-${offer.id}`}>
          {t('offer.disabledBecausePrice')}
        </UncontrolledTooltip>}
      </Col>

      <NoArbitratorWarning arbitrator={offer.arbitrator} />
    </Row>
  );
};

Offer.defaultProps = {
  disabled: false
};

Offer.propTypes = {
  t: PropTypes.func,
  offer: PropTypes.object,
  onClick: PropTypes.func,
  prices: PropTypes.object,
  disabled: PropTypes.bool
};

export default withTranslation()(Offer);
