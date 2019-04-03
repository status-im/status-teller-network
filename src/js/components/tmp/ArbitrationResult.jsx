import React, {Component} from 'react';
import {Button, FormGroup, Input} from "reactstrap";
import PropTypes from 'prop-types';
import {ARBITRATION_SOLVED_BUYER, ARBITRATION_SOLVED_SELLER, ARBITRATION_UNSOLVED} from "../../features/arbitration/constants";

class ArbitrationResult extends Component {
  constructor(props) {
    super(props);
    this.state = {
      decision: 0
    };
  }

  onChange(e) {
    this.setState({decision: e.target.value});
  }

  submit() {
    this.props.resolveDispute(this.props.escrowId, this.state.decision);
  }

  render() {
    const solved = this.props.decision.toString() !== ARBITRATION_UNSOLVED;

    if(solved){
      return <span>{this.props.decision.toString() === ARBITRATION_SOLVED_BUYER ? "Funds released to buyer" : "Seller refunded" }</span>;
    }

    return <FormGroup>
      <Input type="select" name="select" id="exampleSelect" onChange={(e) => this.onChange(e)}
             value={this.state.decision} disabled={this.props.disabled}>
        <option value={ARBITRATION_UNSOLVED}>Select</option>
        <option value={ARBITRATION_SOLVED_BUYER}>Release funds to buyer</option>
        <option value={ARBITRATION_SOLVED_SELLER}>Refund seller</option>
      </Input>
      <Button color="secondary" onClick={() => this.submit()} disabled={this.props.disabled}>Solve</Button>
    </FormGroup>;
  }
}

ArbitrationResult.propTypes = {
  escrowId: PropTypes.string,
  decision: PropTypes.number,
  resolveDispute: PropTypes.func,
  disabled: PropTypes.bool
};

export default ArbitrationResult;
