import React, {Component, Fragment} from 'react';
import {FormGroup, Label} from 'reactstrap';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import {withNamespaces} from "react-i18next";
import PropTypes from 'prop-types';
import {required} from "./validators";

class EditContact extends Component {
  render() {
    const {t, username} = this.props;
    return (
      <Fragment>
        <h2 className="mb-4">{t('contactForm.yourNameTitle')}</h2>
        <Form>
          <FormGroup>
            <Label for="nickname">{t('contactForm.statusKeyLabel')}</Label>
            <Input type="text"
                   name="nickname"
                   id="nickname"
                   placeholder="Set nickname"
                   value={username}
                   className="form-control"
                   onChange={(e) => this.props.changeUsername(e.target.value)}
                   validations={[required]}/>
          </FormGroup>
        </Form>
      </Fragment>
    );
  }
}

EditContact.propTypes = {
  t: PropTypes.func,
  changeUsername: PropTypes.func,
  username: PropTypes.string
};

export default withNamespaces()(EditContact);
