/* eslint-disable no-alert,no-restricted-globals */
import React, {Fragment, Component} from 'react';
import {Row, Col} from 'reactstrap';
import PropTypes from 'prop-types';
import RoundedIcon from "../../../ui/RoundedIcon";
import escrow from '../../../features/escrow';
import ConfirmDialog from "../../../components/ConfirmDialog";
import CancelIcon from "../../../../images/close.svg";
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

  render(){
    const {trade, isBuyer, notEnoughETH, canRelay, lastActivity, isETHorSNT} = this.props;
    const shouldDisplay = trade.status === escrow.helpers.tradeStates.waiting || trade.status === escrow.helpers.tradeStates.funded;
    const relayFutureDate = escrow.helpers.nextRelayDate(lastActivity);

    let disabled;
    if(isBuyer){
      if(notEnoughETH){
        disabled = !canRelay || !isETHorSNT;
      }
    } else {
      disabled = (parseInt(this.props.trade.expirationTime, 10) * 1000 > Date.now());
    }

    return shouldDisplay && <Fragment>
      <div onClick={this.displayDialog(true)} className="clickable">
        <Row className={classnames("mt-4 text-primary", {'disabled': disabled})}>
          <Col xs="2">
            <RoundedIcon image={CancelIcon} bgColor="red"/>
          </Col>
          <Col xs="10" className="my-auto ">
            <h6 className="m-0 font-weight-normal text-danger">Cancel trade</h6>
          </Col>
        </Row>
        {
          disabled && !isBuyer && <Row>
            <Col xs="2">
            </Col>
            <Col xs="10" className="text-small">
              Escrow can be canceled after it expires
            </Col>
          </Row>
        }
        {
          disabled && isBuyer && <Row>
            <Col xs="2">
            </Col>
            {isETHorSNT && <Col xs="10" className="text-small">
              Escrow can be canceled in {moment(relayFutureDate).toNow(true)}
            </Col>}
            {!isETHorSNT && <Col xs="10" className="text-small">
              Only ETH and SNT transactions can be canceled when you don&quot;t have enough balance in your wallet
            </Col>}
          </Row>
        }

      </div>
      { !disabled && <ConfirmDialog display={this.state.displayDialog} onConfirm={this.cancelEscrow} onCancel={this.displayDialog(false)} title="Cancel Escrow" content="Are you sure?" cancelText="No" /> }
    </Fragment>;
  }
}

CancelEscrow.defaultProps = {
  notEnoughETH: false,
  canRelay: false,
  isETHorSNT: false
};

CancelEscrow.propTypes = {
  cancelEscrow: PropTypes.func,
  trade: PropTypes.object,
  isBuyer: PropTypes.bool,
  notEnoughETH: PropTypes.bool,
  canRelay: PropTypes.bool,
  lastActivity: PropTypes.number,
  isETHorSNT: PropTypes.bool
};

export default CancelEscrow;

