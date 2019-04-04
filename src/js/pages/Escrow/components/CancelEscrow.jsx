/* eslint-disable no-alert,no-restricted-globals */
import React, {Fragment, Component} from 'react';
import {Row, Col} from 'reactstrap';
import PropTypes from 'prop-types';
import {faTimes} from "@fortawesome/free-solid-svg-icons";

import RoundedIcon from "../../../ui/RoundedIcon";
import escrow from '../../../features/escrow';
import ConfirmDialog from "../../../components/ConfirmDialog";


class CancelEscrow extends Component {

  state = {
    displayDialog: false
  }

  displayDialog = show => (e) => {
    if(e) e.preventDefault();
    this.setState({displayDialog: show});
    return false;
  }

  cancelEscrow = () => {
    this.props.cancelEscrow(this.props.trade.escrowId);
    this.displayDialog(false)();
  }

  render(){
    const {trade} = this.props;
    const shouldDisplay = trade.status === escrow.helpers.tradeStates.waiting || trade.status === escrow.helpers.tradeStates.funded;
    return shouldDisplay && <Fragment>
      <a href="#" onClick={this.displayDialog(true)}>
        <Row className="mt-4 text-primary">
          <Col xs="2">
            <RoundedIcon icon={faTimes} bgColor="blue"/>
          </Col>
          <Col xs="10" className="my-auto">
            <h6 className="m-0">Cancel Trade</h6>
          </Col>
        </Row>
        
      </a>
      <ConfirmDialog display={this.state.displayDialog} onConfirm={this.cancelEscrow} onCancel={this.displayDialog(false)} title="Cancel Escrow" content="Are you sure?"   />
    </Fragment>;
  }
}

CancelEscrow.propTypes = {
  cancelEscrow: PropTypes.func,
  trade: PropTypes.object
};

export default CancelEscrow;
