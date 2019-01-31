import React, {Component, Fragment} from 'react';
import {FormGroup, Label} from 'reactstrap';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import PropTypes from 'prop-types';
import {required} from "../../validators";

class SellerContact extends Component {
  changeNickname(e) {
    this.props.changeNickname(e.target.value);
  }
  changeContactCode(e) {
    this.props.changeContactCode(e.target.value);
  }

  render() {
    return (
      <Fragment>
        <h2>Your name and how to contact you</h2>
        <p>What would be the best way for the buyer to contact you</p>

        <Form>
          <FormGroup>
            <Label for="nickname">Nickname</Label>
            <Input type="text" name="nickname" id="nickname" value={this.props.nickname} className="form-control"
                   onChange={(e) => this.changeNickname(e)} validations={[required]}/>
          </FormGroup>
          <FormGroup>
            <Label for="contactCode">Status contact code or Status ENS name</Label>
            <Input type="text" name="contactCode" id="contactCode" value={this.props.contactCode}
                   className="form-control" onChange={(e) => this.changeContactCode(e)}  validations={[required]}/>
          </FormGroup>
        {(!this.props.nickname || !this.props.contactCode) && <p className="text-info">Enter a location to move to the next page</p>}
        </Form>
      </Fragment>
    );
  }
}

SellerContact.propTypes = {
  changeNickname: PropTypes.func,
  changeContactCode: PropTypes.func,
  nickname: PropTypes.string,
  contactCode: PropTypes.string
};


export default SellerContact;
