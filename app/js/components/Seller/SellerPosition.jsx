import React, {Component} from 'react';
import {Form, FormGroup, Input} from 'reactstrap';
import PropTypes from 'prop-types';

class SellerPosition extends Component {
  changeLocation(e) {
    this.props.changeLocation(e.target.value);
  }

  render() {
    return (
      <React.Fragment>
        <h2>Your location</h2>
        <p>What location do you want to display</p>

        <Form>
          <FormGroup>
            <Input type="text" name="location" id="location" placeholder="City, Country" onChange={(e) => this.changeLocation(e)}/>
          </FormGroup>
        </Form>
      </React.Fragment>
    );
  }
}

SellerPosition.propTypes = {
  changeLocation: PropTypes.func
};


export default SellerPosition;
