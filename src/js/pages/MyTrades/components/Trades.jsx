import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {Card, Row, Col, CardBody, CardFooter} from 'reactstrap';
import {withTranslation} from 'react-i18next';
import {tradeStates, tradeStatesFormatted, completedStates} from "../../../features/escrow/helpers";
import {addressCompare} from "../../../utils/address";
import {formatFiatPrice, truncateTwo} from '../../../utils/numbers';
import {calculateEscrowPrice} from '../../../utils/transaction';
import {ARBITRATION_SOLVED_BUYER, ARBITRATION_SOLVED_SELLER} from "../../../features/arbitration/constants";
import RoundedIcon from "../../../ui/RoundedIcon";
import classnames from 'classnames';
import './Trades.scss';
import {getTokenImage} from "../../../utils/images";
import messageImage from '../../../../images/read-chat.svg';
import moneyImage from '../../../../images/money-hand.svg';

import {PAYMENT_METHODS} from "../../../features/metadata/constants";

import UserInfoRow from "../../../components/UserInfoRow";
import {stringToContact} from "../../../utils/strings";

class Trades extends Component {
  state = {
    filteredState: '',
    showFilters: false
  };

  // eslint-disable-next-line complexity
  getTradeStyle(trade, isBuyer) {
    const t = this.props.t;
    if (trade.mining) {
      return {text: t('trades.mining'), className: 'bg-info'};
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

    const actionNeeded = t('trades.actionNeeded');
    const sellersTurn = t('escrow.general.sellersTurn');
    const buyersTurn = t('escrow.general.buyersTurn');

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
  }

  renderTrades() {
    const t = this.props.t;
    return (
      <Fragment>
        <div className="profile-trades-list border-0 pt-0">
          {(() => {
            const trades = this.props.trades.filter(x => { return this.props.active ? !completedStates.includes(x.status) : completedStates.includes(x.status); }).map((trade, index) => {
              if (this.state.filteredState && trade.status !== this.state.filteredState) {
                return null;
              }

              const isBuyer = addressCompare(trade.buyer, this.props.address);
              const tradeStyle = this.getTradeStyle(trade, isBuyer);
              const address = isBuyer ? trade.buyer : trade.offer.owner;
              const userInfo = isBuyer ? trade.seller : trade.buyerInfo;

              return (<Card key={index} className={classnames("clickable mb-3 shadow border-0 offer-card", {"card-transparent": !this.props.active})}
                            onClick={() => this.props.tradeClick(trade.escrowId)}>
                <CardBody>
                  <UserInfoRow hideAddress user={userInfo}
                               address={address}
                               lastColSize={4}
                               lastCol={<div className="text-right">
                                 <span
                                   className={"p-1 px-2 d-inline text-white rounded-sm text-small nowrap " + tradeStyle.className}>{tradeStyle.text}</span>
                               </div>}/>
                   <Row className="mt-2">
                     <Col xs={2} md={1}><RoundedIcon image={messageImage} bgColor="blue" size="sm"/></Col>
                     <Col xs={10} md={11} className="pl-0">{stringToContact(userInfo.contactData).method}</Col>
                   </Row>
                   <Row className="mt-2">
                     <Col xs={2} md={1}><RoundedIcon image={moneyImage} bgColor="blue" size="sm"/></Col>
                     <Col xs={10} md={11} className="pl-0">{trade.offer.paymentMethods.map(method => PAYMENT_METHODS[method]).join(', ')}</Col>
                   </Row>
                </CardBody>
                <CardFooter className="bg-white text-right border-0 pt-0 clickable mt-3">
                  <p className="m-0 border-top pt-2">
                    {t('general.buy')} <span className="text-black"><img
                    src={getTokenImage(trade.token.symbol)}
                    alt={trade.token.symbol + ' icon'}/> {trade.token.symbol}</span> {t('trades.at')} <span
                    className="font-weight-bold text-black">{formatFiatPrice(calculateEscrowPrice(trade, this.props.prices))} {trade.currency}</span>
                  </p>
                </CardFooter>
              </Card>);
            });
            if (trades.every(trade => trade === null)) {
              return (
                <Row className="my-1 border-bottom shadow-sm p-2 mb-3">
                  <Col className="align-self-center pt-3 pb-3 text-center text-muted">{t('trades.noFilteredTrades')}</Col>
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

export default withTranslation()(Trades);
