import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Card, Row, Col} from 'reactstrap';
import {Link} from "react-router-dom";
import {withNamespaces} from 'react-i18next';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircle, faArrowRight} from "@fortawesome/free-solid-svg-icons";
import Identicon from "../../../components/UserInformation/Identicon";
import {formatBalance} from "../../../utils/numbers";

class Trades extends Component {
  renderTrades() {
    const address = this.props.address;
    return (
      <Card body className="py-2 px-3 shadow-sm">
        {this.props.trades.map((trade, index) => {
          const isBuyer = trade.buyer ===  address;
          return <Link key={index} to={"/escrow/" + trade.escrowId}>
            <Row className="my-1 border-bottom">
              <Col className="align-self-center pr-0" xs="2">
                <Identicon seed={ isBuyer ? trade.offer.owner : trade.buyer} scale={5} className="align-middle rounded-circle topCircle border"/>
              </Col>
              <Col className="align-self-center" xs="3">
                <span>{isBuyer ? trade.seller.username : trade.buyerInfo.username}</span>
              </Col>
              <Col className="align-self-center" xs="4">
                {isBuyer ? 'Buy' : 'Sell' } {formatBalance(trade.tokenAmount)} {trade.token.symbol}
              </Col>
              <Col className="align-self-center text-right text-success" xs="3">
                <FontAwesomeIcon icon={faCircle} className="mr-2"/>
                {trade.status}
              </Col>
            </Row>
          </Link>;
        })}
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
  trades: PropTypes.array,
  address: PropTypes.string
};

export default withNamespaces()(Trades);
