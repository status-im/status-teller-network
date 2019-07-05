import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Card, CardHeader, CardBody, Button} from 'reactstrap';
import { Link } from "react-router-dom";
import { withNamespaces } from 'react-i18next';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faEllipsisV, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import ConfirmDialog from "../../../components/ConfirmDialog";
import {CURRENCY_DATA} from "../../../constants/currencies";
import {zeroAddress} from '../../../utils/address';
import NoArbitratorWarning from "../../../components/NoArbitratorWarning";

class Offers extends Component {
  state = {
    displayDialog: false,
    offerId: null
  }

  handleClose = () => {
    this.setState({ displayDialog: false });
  };

  confirmDelete = offerId => (e) => {
    if(e) e.preventDefault();
    this.setState({ offerId, displayDialog: true });
    return false;
  }

  displayDialog = show => () => {
    this.setState({displayDialog: show});
    return false;
  };


  deleteOffer = () => {
    this.props.deleteOffer(this.state.offerId);
    this.setState({offerId: null, displayDialog: false});
  }

  renderOffers() {
    const {t, offers} = this.props;
    return offers.map((offer, index) => (
      <Card key={index} className="mb-2 shadow-sm">
        <CardHeader>
          {offer.token.symbol}
          <FontAwesomeIcon icon={faArrowRight} className="mx-4"/>
          <span className="text-small font-italic mr-2">{CURRENCY_DATA.find(x => x.id === offer.currency).symbol}</span>
          {offer.currency}
          <Button className="p-0 pl-3 pr-3 m-0 float-right btn-link" onClick={this.confirmDelete(offer.id)}>
            <FontAwesomeIcon icon={faEllipsisV} />
          </Button>
        </CardHeader>
        <CardBody>
          <Row>
            <dl className="col-6">
              <dt>{t('offers.type')}</dt>
              <dd>{t('offers.typeSell')}</dd>
            </dl>
            <dl className="col-6">
              <dt>{t('offers.paymentMethods')}</dt>
              <dd>{offer.paymentMethodsForHuman}</dd>
            </dl>
          </Row>
          <Row>
            <dl className="col-6">
              <dt>{t('offers.location')}</dt>
              <dd>{this.props.location}</dd>
            </dl>
            <dl className="col-6">
              <dt>{t('offers.rate')}</dt>
              <dd>{offer.rateForHuman}</dd>
            </dl>
          </Row>
          <Row>
            <dl className="col-12">
              <dt>Arbitrator</dt>
              {offer.arbitrator === zeroAddress && <dd>
                <NoArbitratorWarning arbitrator={offer.arbitrator} />
              </dd>}
              {offer.arbitrator !== zeroAddress && <dd>{offer.arbitratorData.username} ({offer.arbitrator})</dd> }       
            </dl>
          </Row>
        </CardBody>
      </Card>
    ));
  }

  renderEmpty() {
    const {t} = this.props;
    return (
      <Card body className="text-center">
        {t('offers.noOpen')}
      </Card>
    );
  }

  render() {
    const {t, offers} = this.props;
    return (
      <div className="mt-3">
        <div>
          <h3 className="d-inline-block">{t('offers.title')}</h3>
          <span className="float-right">
            <Link to="/license" className="float-right">{t('offers.create')} <FontAwesomeIcon icon={faArrowRight}/></Link>
          </span>
        </div>
        {offers.length === 0 ? this.renderEmpty() : this.renderOffers()}
        <ConfirmDialog display={this.state.displayDialog} onConfirm={this.deleteOffer} onCancel={this.displayDialog(false)} title="Delete offer" content="Are you sure?" cancelText="No" />
      </div>
    );
  }
}

Offers.propTypes = {
  t: PropTypes.func,
  location: PropTypes.string,
  offers: PropTypes.array,
  deleteOffer: PropTypes.func
};

export default withNamespaces()(Offers);
