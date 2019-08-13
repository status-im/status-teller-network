/* eslint-disable no-alert,no-restricted-globals */
import React, {Fragment, Component} from 'react';
import {Row, Col} from 'reactstrap';
import PropTypes from 'prop-types';
import RoundedIcon from "../../../ui/RoundedIcon";
import ConfirmDialog from "../../../components/ConfirmDialog";
import CancelIcon from "../../../../images/close.svg";
import classnames from 'classnames';

class CancelDispute extends Component {

  state = {
    displayDialog: false
  };

  displayDialog = show => (e) => {
    if(e) e.preventDefault();
    this.setState({displayDialog: show});
    return false;
  };

  cancelDispute = () => {
    this.props.cancelDispute(this.props.trade.escrowId);
    this.displayDialog(false)();
  };

  render(){
    return <Fragment>
      <div onClick={this.displayDialog(true)} className="clickable">
        <Row className={classnames("mt-4 text-primary")}>
          <Col xs="2">
            <RoundedIcon image={CancelIcon} bgColor="red"/>
          </Col>
          <Col xs="10" className="my-auto ">
            <h6 className="m-0 font-weight-normal text-danger">Cancel Dispute</h6>
          </Col>
        </Row>

      </div>
      <ConfirmDialog display={this.state.displayDialog} onConfirm={this.cancelDispute} onCancel={this.displayDialog(false)} title="Cancel Dispute" content="Are you sure?" cancelText="No" />
    </Fragment>;
  }
}

CancelDispute.propTypes = {
  cancelDispute: PropTypes.func,
  trade: PropTypes.object,
  isBuyer: PropTypes.bool
};

export default CancelDispute;
