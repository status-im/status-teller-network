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
        <h2 className="mb-4">What location do you want to display</h2>
        <Form>
          <FormGroup>
            <Input type="text" name="location" id="location" placeholder="City, Country"
                   value={this.props.location || ''} onChange={(e) => this.changeLocation(e)}/>
          </FormGroup>
          {!this.props.location && <p className="text-muted">Enter a location to move to the next page</p>}
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
