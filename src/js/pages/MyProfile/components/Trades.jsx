import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Card, Row, Col, Form, FormGroup, Label, Input} from 'reactstrap';
import {Link} from "react-router-dom";
import {withNamespaces} from 'react-i18next';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowRight, faCaretDown} from "@fortawesome/free-solid-svg-icons";
import Identicon from "../../../components/UserInformation/Identicon";
import {formatBalance} from "../../../utils/numbers";
import {tradeStates, tradeStatesFormatted} from "../../../features/escrow/helpers";
import {addressCompare} from "../../../utils/address";
import {ARBITRATION_SOLVED_BUYER, ARBITRATION_SOLVED_SELLER} from "../../../features/arbitration/constants";

import './Trades.scss';

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
  const tradeStyle = {text: tradeStatesFormatted[trade.status]};

  switch(trade.status){
    case tradeStates.waiting: tradeStyle.className = 'bg-primary'; break;
    case tradeStates.funded: tradeStyle.className = 'bg-primary'; break;
    case tradeStates.paid: tradeStyle.className = 'bg-primary'; break;
    case tradeStates.released: tradeStyle.className = 'bg-success'; break;
    case tradeStates.canceled: tradeStyle.className = 'bg-secondary text-black'; break;
    case tradeStates.expired: tradeStyle.className = 'bg-secondary text-black'; break;
    case tradeStates.arbitration_open: tradeStyle.className = 'bg-warning'; break;
    case tradeStates.arbitration_closed: {
      let className;
      if (trade.arbitration.result.toString() === ARBITRATION_SOLVED_BUYER) {
        className = isBuyer ? 'bg-success' : 'bg-danger';
      } else if (trade.arbitration.result.toString() === ARBITRATION_SOLVED_SELLER) {
        className = !isBuyer ? 'bg-success' : 'bg-danger';
      } else {
        className = 'bg-primary';
      }
      tradeStyle.className = className; break;
    }
    default: tradeStyle.className = 'bg-secondary text-black'; break;
  }
  return tradeStyle;
};

class Trades extends Component {
  state = {
    filteredState: '',
    showFilters: false
  };

  filterState(stateName) {
    if (stateName === '') {
      return this.setState({filteredState: ''});
    }
    const stateIndex = Object.values(tradeStatesFormatted).findIndex(tradeState => tradeState === stateName);
    const filteredState = stateIndex === -1 ? '' : Object.keys(tradeStatesFormatted)[stateIndex];
    this.setState({filteredState});
  }

  renderTrades() {
    const address = this.props.address;
    return (
      <Fragment>

        {this.state.showFilters && <Form><b>Filters:</b>
          <FormGroup row className="state-filters">
            <Label for="trade-state-filter" xs={2}>States</Label>
            <Col xs={10}>
              <Input type="select" name="select" id="trade-state-filter"
                     onChange={(e) => this.filterState(e.target.value)}>
                <option/>
                {Object.values(tradeStatesFormatted).map((tradeState, index) => <option
                  key={`tradeState-${index}`}>{tradeState}</option>)}
              </Input>
            </Col>
          </FormGroup>
        </Form>}

        {!this.state.showFilters && <p className="text-small text-muted mb-1 clickable" onClick={() => this.setState({showFilters: true})}>Show Filters <FontAwesomeIcon icon={faCaretDown}/></p>}

        <Card body className="profile-trades-list py-2 px-3 shadow-sm">
          {(() => {
            const trades = this.props.trades.map((trade, index) => {
              if (this.state.filteredState && trade.status !== this.state.filteredState) {
                return null;
              }
              const isBuyer = addressCompare(trade.buyer, address);
              const tradeStyle = getTradeStyle(trade, isBuyer);
              return <Link key={index} to={"/escrow/" + trade.escrowId}>
                <Row className="my-1 border-bottom">
                  <Col className="align-self-center pr-0" xs="2">
                    <Identicon seed={isBuyer ? trade.seller.statusContactCode : trade.buyerInfo.statusContactCode}
                               scale={5} className="align-middle rounded-circle topCircle border"/>
                  </Col>
                  <Col className="align-self-center" xs="3">
                    <span>{isBuyer ? trade.seller.username : trade.buyerInfo.username}</span>
                  </Col>
                  <Col className="align-self-center" xs="3" md={4}>
                    {isBuyer ? 'Buy' : 'Sell'} {formatBalance(trade.tokenAmount)} {trade.token.symbol}
                  </Col>
                  <Col className="align-self-center text-center text-success" xs="4" md={3}>
                  <span
                    className={"p-1 text-uppercase d-inline text-white rounded-sm text-small nowrap " + tradeStyle.className}>{tradeStyle.text}</span>
                  </Col>
                </Row>
              </Link>;
            });
            if (trades.every(trade => trade === null)) {
              return this.props.t('trades.noFilteredTrades');
            }
            return trades;
          })()}
        </Card>
      </Fragment>
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
