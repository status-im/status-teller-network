import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Card} from 'reactstrap';
import {Link} from "react-router-dom";
import {withNamespaces} from 'react-i18next';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircle, faArrowRight} from "@fortawesome/free-solid-svg-icons";
import Identicon from "../../../components/UserInformation/Identicon";

class Trades extends Component {
  renderTrades() {
    return (
      <Card body className="py-2 px-3 shadow-sm">
        {this.props.trades.map((trade, index) => (
          <div key={index} className="d-flex my-1">
              <span className="flex-fill align-self-center">
                <Link to={"/escrow/" + trade.escrowId}>
                  <Identicon seed={trade.buyer} scale={5} className="align-middle rounded-circle topCircle border"/>
                  <Identicon seed={trade.offer.owner} scale={5} className="align-middle rounded-circle bottomCircle border"/>
                  <span className="ml-2">{trade.buyerInfo.username} & {trade.seller.username}</span>
                </Link>
              </span>
              <span className="flex-fill align-self-center">{trade.tokenAmount} {trade.token.symbol}</span>
              <span className="flex-fill align-self-center text-right text-success">
                <FontAwesomeIcon icon={faCircle} className="mr-2"/>
                {trade.status}
              </span>
          </div>
        ))}
      </Card>
    );
  }

  renderEmpty() {
    const {t} = this.props;
    return (
      <Card body className="text-center">
        {t('trades.noOpen')}
      </Card>
    );
  }

  render() {
    const {t, trades} = this.props;
    return (
      <div className="mt-3">
        <div>
          <h3 className="d-inline-block">{t('trades.title')}</h3>
          <span className="float-right">
            <Link to="/buy" className="float-right">{t('trades.find')} <FontAwesomeIcon icon={faArrowRight}/></Link>
          </span>
        </div>
        {trades.length === 0 ? this.renderEmpty(t) : this.renderTrades()}
      </div>
    );
  }
}

Trades.propTypes = {
  t: PropTypes.func,
  trades: PropTypes.array
};

export default withNamespaces()(Trades);
