import React, {Component} from 'react';
import {Form, FormGroup, Input, Label} from 'reactstrap';
import PropTypes from 'prop-types';

class SellerPosition extends Component {
  changeLocation(e) {
    this.props.changeLocation(e.target.value);
  }

  render() {
    return (
      <React.Fragment>
        <h2>What location do you want to display</h2>
        <Form>
          <FormGroup>
            <Label className="text-small mt-3 mb-0">City</Label>
            <Input type="text" name="location" id="location" placeholder="Enter City"
                   value={this.props.location || ''} onChange={(e) => this.changeLocation(e)}/>
          </FormGroup>
        </Form>
      </React.Fragment>
    );
  }
}

SellerPosition.propTypes = {
  changeLocation: PropTypes.func,
  location: PropTypes.string
};


export default SellerPosition;
