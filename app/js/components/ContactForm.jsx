import React, {Component, Fragment} from 'react';
import {FormGroup, Label, Button} from 'reactstrap';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import {withNamespaces} from "react-i18next";
import PropTypes from 'prop-types';
import {required} from "../validators";

class ContactForm extends Component {
  render() {
    const {t, username, statusContactCode} = this.props;

    return (
      <Fragment>
        <h2>{t('contactForm.yourName')}</h2>
        <p>{t('contactForm.bestWay')}</p>

        <Form>
          <FormGroup>
            <Label for="nickname" className="text-dark">Set nickname</Label>
            <Input type="text"
                   name="nickname"
                   id="nickname"
                   value={username}
                   className="form-control"
                   onChange={(e) => this.props.changeUsername(e.target.value)}
                   validations={[required]}/>
          </FormGroup>
          <FormGroup>
            <Label for="contactCode" className="text-dark">Status contact code or Status ENS name</Label>
            <Input type="text"
                   name="contactCode"
                   id="contactCode"
                   value={statusContactCode}
                   className="form-control"
                   onChange={(e) => this.props.changeStatusContactCode(e.target.value)}
                   validations={[required]}/>
            <Button className="input-icon p-0" color="link">Give access</Button>
          </FormGroup>
        </Form>
      </Fragment>
    );
  }
}

ContactForm.propTypes = {
  t: PropTypes.func,
  changeUsername: PropTypes.func,
  changeStatusContactCode: PropTypes.func,
  username: PropTypes.string,
  statusContactCode: PropTypes.string
};


export default withNamespaces()(ContactForm);
