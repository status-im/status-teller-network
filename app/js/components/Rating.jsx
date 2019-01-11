import React, {Component} from 'react';
import {Button, FormGroup, Input, Label} from "reactstrap";
import PropTypes from 'prop-types';

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

  render() {
    const disabled = this.props.rating !== 0;
    return (<FormGroup>
      <Label for="exampleSelect">Rating: </Label>
      <Input type="select" name="select" id="exampleSelect" disabled={disabled}
             onChange={(e) => this.onChange(e)} value={this.props.rating || this.state.rating}>
        <Options/>
      </Input>
      {!disabled && <Button color="secondary">Rate</Button>}
    </FormGroup>);
  }
}

Rating.propTypes = {
  rating: PropTypes.number
};

export default Rating;
