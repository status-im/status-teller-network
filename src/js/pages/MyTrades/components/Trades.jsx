import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Card, Row, Col, Form, FormGroup, Label, Input, CardBody, CardFooter} from 'reactstrap';
import {withNamespaces} from 'react-i18next';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretDown} from "@fortawesome/free-solid-svg-icons";
import {tradeStates, tradeStatesFormatted, completedStates} from "../../../features/escrow/helpers";
import {addressCompare} from "../../../utils/address";
import {truncateTwo} from '../../../utils/numbers';
import {calculateEscrowPrice} from '../../../utils/transaction';
import {ARBITRATION_SOLVED_BUYER, ARBITRATION_SOLVED_SELLER} from "../../../features/arbitration/constants";
import RoundedIcon from "../../../ui/RoundedIcon";

import './Trades.scss';
import {getTokenImage} from "../../../utils/images";
import messageImage from '../../../../images/read-chat.svg';
import moneyImage from '../../../../images/money-hand.svg';

import {PAYMENT_METHODS} from "../../../features/metadata/constants";

import UserInfoRow from "../../../components/UserInfoRow";

const getTradeStyle = (trade, isBuyer) => {
  if (trade.mining) {
    return {text: 'Mining', className: 'bg-info'};
  }
  if (trade.arbitration) {
    if (trade.arbitration.open) {
      trade.status = tradeStates.arbitration_open;
    } else {
      if (trade.arbitration.result !== '0') {
        trade.status = tradeStates.arbitration_closed;
      }
    }
  }
  const tradeStyle = {text: tradeStatesFormatted[trade.status]};

  const actionNeeded = 'Action needed';
  const sellersTurn = "Seller's turn";
  const buyersTurn = "Buyer's turn";

  switch (trade.status) {
    case tradeStates.waiting:
      tradeStyle.className = isBuyer ? 'bg-dark' : 'bg-warning';
      tradeStyle.text = isBuyer ? sellersTurn : actionNeeded;
      break;
    case tradeStates.funded:
      tradeStyle.className = isBuyer ? 'bg-warning' : 'bg-dark';
      tradeStyle.text = isBuyer ? actionNeeded : buyersTurn;
      break;
    case tradeStates.paid:
      tradeStyle.className = isBuyer ? 'bg-dark' : 'bg-warning';
      tradeStyle.text = isBuyer ? sellersTurn : actionNeeded;
      break;
    case tradeStates.released:
      tradeStyle.className = 'bg-success';
      break;
    case tradeStates.canceled:
      tradeStyle.className = 'bg-danger';
      break;
    case tradeStates.expired:
      tradeStyle.className = 'bg-secondary text-black';
      break;
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
    return (
      <Fragment>

        {this.state.showFilters && <Form><b>Filters:</b>
          <FormGroup row className="state-filters">
            <Label for="trade-state-filter" xs={2}>States</Label>
            <Col xs={10}>
              <Input type="select" name="select" id="trade-state-filter"
                     onChange={(e) => this.filterState(e.target.value)}>
                <option/>
                { Object.keys(tradeStatesFormatted)
                        .filter(x => { return this.props.active ?  !completedStates.includes(x) : completedStates.includes(x); })
                        .map((tradeState, index) => <option
                  key={`tradeState-${index}`}>{tradeStatesFormatted[tradeState]}</option>)}
              </Input>
            </Col>
          </FormGroup>
        </Form>}

        {!this.state.showFilters && <p className="text-small text-muted mb-1 clickable" onClick={() => this.setState({showFilters: true})}>Show Filters <FontAwesomeIcon icon={faCaretDown}/></p>}

        <div className="profile-trades-list border-0 pt-0">
          {(() => {
            const trades = this.props.trades.filter(x => { return this.props.active ? !completedStates.includes(x.status) : completedStates.includes(x.status); }).map((trade, index) => {
              if (this.state.filteredState && trade.status !== this.state.filteredState) {
                return null;
              }

              const isBuyer = addressCompare(trade.buyer, this.props.address);
              const tradeStyle = getTradeStyle(trade, isBuyer);

              return (<Card key={index} className="mb-3 shadow border-0 offer-card"
                            onClick={() => this.props.tradeClick(trade.escrowId)}>
                <CardBody>
                  <UserInfoRow hideAddress user={isBuyer ? trade.seller : trade.buyerInfo}
                               address={isBuyer ? trade.buyer : trade.offer.owner}
                               lastColSize={4}
                               lastCol={<div className="text-right">
                                 <span
                                   className={"p-1 px-2 d-inline text-white rounded-sm text-small nowrap " + tradeStyle.className}>{tradeStyle.text}</span>
                               </div>}/>
                   <Row className="mt-2">
                     <Col xs={2}><RoundedIcon image={messageImage} bgColor="blue" size="sm"/></Col>
                     <Col xs={10} className="pl-0">Status {/*TODO Put the real comm method once contract is implemented*/}</Col>
                   </Row>
                   <Row className="mt-2">
                     <Col xs={2}><RoundedIcon image={moneyImage} bgColor="blue" size="sm"/></Col>
                     <Col xs={10} className="pl-0">{trade.offer.paymentMethods.map(method => PAYMENT_METHODS[method]).join(', ')}</Col>
                   </Row>
                </CardBody>
                <CardFooter className="bg-white text-right border-0 pt-0 clickable">
                  <p className="m-0 border-top pt-2">
                    Buy <span className="text-black"><img
                    src={getTokenImage(trade.token.symbol)}
                    alt={trade.token.symbol + ' icon'}/> {trade.token.symbol}</span> at <span
                    className="font-weight-bold text-black">{truncateTwo(calculateEscrowPrice(trade, this.props.prices))} {trade.currency}</span>
                  </p>
                </CardFooter>
              </Card>);
            });
            if (trades.every(trade => trade === null)) {
              return (
                <Row className="my-1 border-bottom shadow-sm p-2 mb-3">
                  <Col className="align-self-center pt-3 pb-3 text-center text-muted">{this.props.t('trades.noFilteredTrades')}</Col>
                </Row>
              );
            }
            return trades;
          })()}
        </div>
      </Fragment>
    );
  }

  renderEmpty() {
    const {t, active} = this.props;
    return (
      <Card body className="text-center border-0 text-muted shadow-sm">
        {active ? t('trades.noActiveTrades') : t('trades.noPastTrades')}
      </Card>
    );
  }

  render() {
    const {t, trades} = this.props;
    return (
      <div className="mb-5">
        {trades.length === 0 ? this.renderEmpty(t) : this.renderTrades()}
      </div>
    );
  }
}

Trades.defaultProps = {
  active: false
};

Trades.propTypes = {
  t: PropTypes.func,
  trades: PropTypes.array,
  prices: PropTypes.object,
  address: PropTypes.string,
  tradeClick: PropTypes.func,
  active: PropTypes.bool
};

export default withNamespaces()(Trades);
