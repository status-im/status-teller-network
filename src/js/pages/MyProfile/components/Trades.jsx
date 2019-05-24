import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Card, Row, Col} from 'reactstrap';
import {Link} from "react-router-dom";
import {withNamespaces} from 'react-i18next';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowRight} from "@fortawesome/free-solid-svg-icons";
import Identicon from "../../../components/UserInformation/Identicon";
import {formatBalance} from "../../../utils/numbers";
import {tradeStates} from "../../../features/escrow/helpers";
import {addressCompare} from "../../../utils/address";
import {ARBITRATION_SOLVED_BUYER, ARBITRATION_SOLVED_SELLER} from "../../../features/arbitration/constants";

const getTradeStyle = (trade, isBuyer) => {
  if (trade.mining) {
    return {text: 'Mining', className: 'bg-info'};
  }
  if(trade.arbitration){
    if(trade.arbitration.open){
      trade.status = tradeStates.arbitration_open;
    } else {
      if(trade.arbitration.result !== '0'){
        trade.status = tradeStates.arbitration_closed;
      }
    }
  }

  switch(trade.status){
    case tradeStates.waiting:
      return {text: 'Open', className: 'bg-primary'};
    case tradeStates.funded:
      return {text: 'Funded', className: 'bg-primary'};
    case tradeStates.paid:
      return {text: 'Paid', className: 'bg-primary'};
    case tradeStates.released:
      return {text: 'Done', className: 'bg-success'};
    case tradeStates.canceled:
      return {text: 'Canceled', className: 'bg-secondary'};
    case tradeStates.expired:
      return {text: 'Expired', className: 'bg-secondary'};
    case tradeStates.arbitration_open:
      return {text: 'Arbitration', className: 'bg-danger'};
    case tradeStates.arbitration_closed: {
      let className;
      if (trade.arbitration.result.toString() === ARBITRATION_SOLVED_BUYER) {
        className = isBuyer ? 'bg-success' : 'bg-danger';
      } else if (trade.arbitration.result.toString() === ARBITRATION_SOLVED_SELLER) {
        className = !isBuyer ? 'bg-success' : 'bg-danger';
      } else {
        className = 'bg-primary';
      }
      return {text: 'Resolved', className};
    }
    default:
      return {text: trade.status, className: 'bg-secondary'};
  }
};

class Trades extends Component {
  renderTrades() {
    const address = this.props.address;
    return (
      <Card body className="py-2 px-3 shadow-sm">
        {this.props.trades.map((trade, index) => {
          const isBuyer = addressCompare(trade.buyer, address);
          const tradeStyle = getTradeStyle(trade, isBuyer);
          return <Link key={index} to={"/escrow/" + trade.escrowId}>
            <Row className="my-1 border-bottom">
              <Col className="align-self-center pr-0" xs="2">
                 <Identicon seed={ isBuyer ? trade.seller.statusContactCode : trade.buyerInfo.statusContactCode} scale={5} className="align-middle rounded-circle topCircle border"/>
              </Col>
              <Col className="align-self-center" xs="3">
                <span>{isBuyer ? trade.seller.username : trade.buyerInfo.username}</span>
              </Col>
              <Col className="align-self-center" xs="3" md={4}>
                {isBuyer ? 'Buy' : 'Sell' } {formatBalance(trade.tokenAmount)} {trade.token.symbol}
              </Col>
              <Col className="align-self-center text-center text-success" xs="4" md={3}>
                <span className={"p-1 text-uppercase d-inline text-white rounded-sm text-small nowrap " + tradeStyle.className}>{tradeStyle.text}</span>
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
            <Link to="/offers/list" className="float-right">{t('trades.find')} <FontAwesomeIcon icon={faArrowRight}/></Link>
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
