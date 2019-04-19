/* eslint-disable no-alert,no-restricted-globals */
import React, {Fragment, Component} from 'react';
import {Row, Col} from 'reactstrap';
import PropTypes from 'prop-types';
import RoundedIcon from "../../../ui/RoundedIcon";
import escrow from '../../../features/escrow';
import ConfirmDialog from "../../../components/ConfirmDialog";
import CancelIcon from "../../../../images/close.png";

class CancelEscrow extends Component {

  state = {
    displayDialog: false
  };

  displayDialog = show => (e) => {
    if(e) e.preventDefault();
    this.setState({displayDialog: show});
    return false;
  };

  cancelEscrow = () => {
    this.props.cancelEscrow(this.props.trade.escrowId);
    this.displayDialog(false)();
  };

  render(){
    const {trade} = this.props;
    const shouldDisplay = trade.status === escrow.helpers.tradeStates.waiting || trade.status === escrow.helpers.tradeStates.funded;
    return shouldDisplay && <Fragment>
      <div onClick={this.displayDialog(true)} className="clickable">
        <Row className="mt-4 text-primary">
          <Col xs="2">
            <RoundedIcon image={CancelIcon} bgColor="red"/>
          </Col>
          <Col xs="10" className="my-auto ">
            <h6 className="m-0">Cancel trade</h6>
          </Col>
        </Row>

      </div>
      <ConfirmDialog display={this.state.displayDialog} onConfirm={this.cancelEscrow} onCancel={this.displayDialog(false)} title="Cancel Escrow" content="Are you sure?"   />
    </Fragment>;
  }
}

CancelEscrow.propTypes = {
  cancelEscrow: PropTypes.func,
  trade: PropTypes.object
};

export default CancelEscrow;
