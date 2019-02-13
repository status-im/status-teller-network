import React, {Component, Fragment} from 'react';
import {FormGroup, Label} from 'reactstrap';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import {withNamespaces} from "react-i18next";
import PropTypes from 'prop-types';
import {required} from "../validators";

class ContactForm extends Component {
  render() {
    const {t, username, statusContractCode} = this.props;

    return (
      <Fragment>
        <h2>{t('contactForm.yourName')}</h2>
        <p>{t('contactForm.bestWay')}</p>

        <Form>
          <FormGroup>
            <Label for="nickname">Nickname</Label>
            <Input type="text"
                   name="nickname"
                   id="nickname"
                   value={username}
                   className="form-control"
                   onChange={(e) => this.props.changeUsername(e.target.value)}
                   validations={[required]}/>
          </FormGroup>
          <FormGroup>
            <Label for="contactCode">Status contact code or Status ENS name</Label>
            <Input type="text"
                   name="contactCode"
                   id="contactCode"
                   value={statusContractCode}
                   className="form-control"
                   onChange={(e) => this.props.changeStatusContractCode(e.target.value)}
                   validations={[required]}/>
          </FormGroup>
        </Form>
      </Fragment>
    );
  }
}

ContactForm.propTypes = {
  t: PropTypes.func,
  changeUsername: PropTypes.func,
  changeStatusContractCode: PropTypes.func,
  username: PropTypes.string,
  statusContractCode: PropTypes.string
};


export default withNamespaces()(ContactForm);
