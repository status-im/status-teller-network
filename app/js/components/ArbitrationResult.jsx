import React, {Component} from 'react';
import {Button, FormGroup, Input, Label} from "reactstrap";
import PropTypes from 'prop-types';

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
    this.props.rateTransaction(this.props.escrowId, this.state.decision);
  }

  render() {
    const solved = this.props.decision !== 0;

    if(solved){
      return <span>{this.props.decision}</span>
    }

    return <FormGroup>
      <Input type="select" name="select" id="exampleSelect" onChange={(e) => this.onChange(e)} value={this.state.decision}>
        <option value="0">Select</option>
        <option value="1">Release funds to buyer</option>
        <option value="2">Refund seller</option>
      </Input>
      <Button color="secondary" onClick={() => this.submit()}>Solve</Button>
    </FormGroup>;
  }
}

ArbitrationResult.propTypes = {
  escrowId: PropTypes.string,
  decision: PropTypes.number,
  rateTransaction: PropTypes.func
};

export default ArbitrationResult;
