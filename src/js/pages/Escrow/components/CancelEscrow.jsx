/* eslint-disable no-alert,no-restricted-globals */
import React, {Fragment, Component} from 'react';
import {Row, Col} from 'reactstrap';
import PropTypes from 'prop-types';
import {withTranslation} from "react-i18next";
import RoundedIcon from "../../../ui/RoundedIcon";
import escrow from '../../../features/escrow';
import ConfirmDialog from "../../../components/ConfirmDialog";
import CancelIcon from "../../../../images/cancel.svg";
import CancelIconGray from "../../../../images/cancel-gray.svg";
import classnames from 'classnames';
import moment from 'moment';

class CancelEscrow extends Component {

  state = {
    displayDialog: false
  };

  displayDialog = show => (e) => {
    if(e) e.preventDefault();

    if(!this.props.isBuyer){
      if(parseInt(this.props.trade.expirationTime, 10) * 1000 > Date.now()){
        return false;
      }
    }

    this.setState({displayDialog: show});
    return false;
  };

  cancelEscrow = () => {
    this.props.cancelEscrow(this.props.trade.escrowId);
    this.displayDialog(false)();
  };

// eslint-disable-next-line complexity
  render(){
    const {t, trade, isBuyer, notEnoughETH, canRelay, lastActivity, isETHorSNT} = this.props;
    const shouldDisplay = trade.status === escrow.helpers.tradeStates.waiting || trade.status === escrow.helpers.tradeStates.funded;
    const relayFutureDate = escrow.helpers.nextRelayDate(lastActivity);

    let disabled = false;
    if(isBuyer){
      if(notEnoughETH){
        disabled = !canRelay || !isETHorSNT;
      }
    } else {
      disabled = (parseInt(this.props.trade.expirationTime, 10) * 1000 > Date.now());
    }

    return shouldDisplay && <Fragment>
      <div onClick={this.displayDialog(true)} className="clickable">
        <Row className={classnames("mt-4 text-primary")}>
          <Col xs="2">
            <RoundedIcon image={!disabled ? CancelIcon : CancelIconGray} bgColor={disabled ? "secondary" : "red"}/>
          </Col>
          <Col xs="10" className="my-auto ">
            <p className={classnames("m-0 font-weight-normal", {'text-danger': !disabled, 'text-muted': disabled})}>
              {(isBuyer || (!isBuyer && trade.status === escrow.helpers.tradeStates.waiting)) && t('escrow.cancel.cancelTrade')}
              {!isBuyer && trade.status === escrow.helpers.tradeStates.funded && t('escrow.cancel.cancelAndWithdraw')}
            </p>
            <p className="m-0 text-muted">
              {((isBuyer && !disabled) || (!isBuyer && trade.status === escrow.helpers.tradeStates.waiting)) && t('escrow.cancel.changedMind')}
              {!isBuyer && trade.status === escrow.helpers.tradeStates.funded && !disabled && t('escrow.cancel.buyerNotResponding')}
              {!isBuyer && trade.status === escrow.helpers.tradeStates.funded && disabled && <Fragment>
                {(function() {
                  // This a weird and impromptu function, but it's a simple way to only generate a variable in the jsx render
                  const amountTime = moment(new Date(trade.expirationTime * 1000)).toNow(true);
                  return t('escrow.cancel.availableIn') + amountTime;
                }())}
              </Fragment>}
              {disabled && isBuyer && isETHorSNT && t('escrow.cancel.canBeCanceledIn', {date: moment(relayFutureDate).toNow(true)})}
              {disabled && isBuyer && !isETHorSNT && t('escrow.cancel.onlyETH')}
            </p>
          </Col>
        </Row>
      </div>
      {!disabled && <ConfirmDialog display={this.state.displayDialog} onConfirm={this.cancelEscrow}
                                   onCancel={this.displayDialog(false)}
                                   title={t('escrow.cancel.cancelEscrow')}
                                   content={t('escrow.cancel.youSure')}
                                   cancelText={t('general.no')}/>}
    </Fragment>;
  }
}

CancelEscrow.defaultProps = {
  notEnoughETH: false,
  canRelay: false,
  isETHorSNT: false
};

CancelEscrow.propTypes = {
  t: PropTypes.func,
  cancelEscrow: PropTypes.func,
  trade: PropTypes.object,
  isBuyer: PropTypes.bool,
  notEnoughETH: PropTypes.bool,
  canRelay: PropTypes.bool,
  lastActivity: PropTypes.number,
  isETHorSNT: PropTypes.bool
};

export default withTranslation()(CancelEscrow);

