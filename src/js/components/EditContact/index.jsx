import React, {Component, Fragment} from 'react';
import {FormGroup, Label, Button} from 'reactstrap';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import Textarea from 'react-validation/build/textarea';
import {withNamespaces} from "react-i18next";
import PropTypes from 'prop-types';
import {required, isContactCode} from "../../validators";

class EditContact extends Component {
  render() {
    const {t, username, statusContactCode, isStatus} = this.props;
    return (
      <Fragment>
        <h2>{t('contactForm.yourName')}</h2>
        <Form>
          <FormGroup>
            <Input type="text"
                   name="nickname"
                   id="nickname"
                   placeholder="Set nickname"
                   value={username}
                   className="form-control"
                   onChange={(e) => this.props.changeUsername(e.target.value)}
                   validations={[required]}/>
          </FormGroup>
          <FormGroup>
            <Textarea type="text"
                   name="contactCode"
                   id="contactCode"
                   rows="5"
                   placeholder="Status contact code or Status ENS name"
                   value={statusContactCode}
                   className="form-control"
                   onChange={(e) => this.props.changeStatusContactCode(e.target.value)}
                   validations={[required, isContactCode]}/>
            {isStatus && <Button className="input-icon p-0" color="link" onClick={(e) => this.props.getContactCode()}>Give access</Button>}
          </FormGroup>
        </Form>
      </Fragment>
    );
  }
}

EditContact.propTypes = {
  t: PropTypes.func,
  changeUsername: PropTypes.func,
  changeStatusContactCode: PropTypes.func,
  getContactCode: PropTypes.func,
  username: PropTypes.string,
  statusContactCode: PropTypes.string,
  isStatus: PropTypes.bool
};


export default withNamespaces()(EditContact);
