import React, {Component, Fragment} from 'react';
import {FormGroup, Button} from 'reactstrap';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import Textarea from 'react-validation/build/textarea';
import {withNamespaces} from "react-i18next";
import PropTypes from 'prop-types';
import {required, isContactCode, validENS} from "../../validators";

const domain = ".stateofus.eth";

class EditContact extends Component {
  handleContactCodeChange = (e) => {
    const statusContactCode = e.target.value.toLowerCase();
    this.props.changeStatusContactCode(statusContactCode);
  }

  handleContactCodeBlur = (e) => {
    const statusContactCode = e.target.value.toLowerCase();
    if(validENS(statusContactCode) && statusContactCode.indexOf(domain) === -1){
      this.props.changeStatusContactCode(statusContactCode + domain);
    }
  }

  render() {
    const {t, username, statusContactCode, isStatus, ensError} = this.props;
    return (
      <Fragment>
        <h2 className="mb-4">{t('contactForm.yourName')}</h2>
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
                   onBlur={this.handleContactCodeBlur}
                   className="form-control"
                   onChange={this.handleContactCodeChange}
                   validations={[required, isContactCode]}/>
            {ensError && (<div className="d-block invalid-feedback">{ensError}</div>)}
            {isStatus && <Button className="input-icon p-0" color="link" onClick={(e) => this.props.getContactCode()}>Give access</Button>}
          </FormGroup>
          {statusContactCode.indexOf(domain) > -1 && <p className="text-center">
            <Button color="primary" onClick={(e) => this.props.resolveENSName(statusContactCode)}>
              Resolve ENS name
            </Button>
          </p>}
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
  isStatus: PropTypes.bool,
  resolveENSName: PropTypes.func,
  ensError: PropTypes.string
};


export default withNamespaces()(EditContact);
