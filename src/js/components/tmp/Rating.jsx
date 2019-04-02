import React, {Component} from 'react';
import {Button, FormGroup, Input, Label} from "reactstrap";
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';

const Options = () => {
  const buttons = [];
  for (let i = 5; i >= 1; i--) {
    buttons.push(<option key={'rating-' + i}>{i}</option>);
  }
  return buttons;
};

class Rating extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rating: 0
    };
  }

  onChange(e) {
    this.setState({rating: e.target.value});
  }

  submit() {
    this.props.rateTransaction(this.props.escrowId, this.state.rating);
  }

  render() {
    const disabled = this.props.rating !== 0;
    return (<FormGroup>
      <Label for="exampleSelect">{this.props.t('rating.label')} </Label>
      <Input type="select" name="select" id="exampleSelect" disabled={disabled}
             onChange={(e) => this.onChange(e)} value={this.props.rating || this.state.rating}>
        <Options/>
      </Input>
      {!disabled && <Button color="secondary" onClick={() => this.submit()}>Rate</Button>}
    </FormGroup>);
  }
}

Rating.propTypes = {
  t: PropTypes.func,
  escrowId: PropTypes.string,
  rating: PropTypes.number,
  rateTransaction: PropTypes.func
};

export default withNamespaces()(Rating);
