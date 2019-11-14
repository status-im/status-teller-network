import React, {Component, Fragment} from 'react';
import {FormGroup, Button, Label, Row, Col} from 'reactstrap';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import {withNamespaces} from "react-i18next";
import PropTypes from 'prop-types';
import {required, isContactCode, validENS} from "./validators";
import CheckButton from "../../ui/CheckButton";
import RoundedIcon from "../../ui/RoundedIcon";

import infoImageRed from '../../../images/info-red.svg';
import infoImage from '../../../images/small-info.svg';
import checkCircleImage from '../../../images/check-circle.svg';

const domain = ".stateofus.eth";
const STATUS = 'Status';

class EditContactList extends Component {
  constructor(props) {
    super(props);
    this.contactMethods = [
      {name: STATUS, label: props.t('contactForm.statusKeyLabel'), placeholder: 'Status contact code or Status ENS name'},
      {name: 'Telegram', label: 'Telegram ID', placeholder: 'eg. @Vitalik94'},
      {name: 'Line', label: 'User ID', placeholder: 'eg. @Vitalik94'},
      {name: 'KakaoTalk', label: 'KakaoTalk ID', placeholder: 'eg. Vitalik94'},
      {name: 'WeChat', label: 'WeChat ID', placeholder: 'eg. Vitalik94'}
    ];
  }

  isStatusSelected() {
    return this.props.contactMethod === STATUS;
  }

  handleContactCodeChange = (e) => {
    const contactCode = e.target.value.toLowerCase();
    this.props.changeContactCode(contactCode);
  };

  handleContactCodeBlur = (e) => {
    if (!this.isStatusSelected()) {
      return;
    }
    const contactCode = e.target.value.toLowerCase();
    if (validENS(contactCode) && !this.isStatusENSDomain(contactCode) && !this.isENSName(contactCode)) {
      this.props.changeContactCode(contactCode + domain);
    }
  };

  isENSName = (contactCode) => contactCode && contactCode.endsWith(".eth");

  isStatusENSDomain = (contactCode) => contactCode && contactCode.indexOf(domain) > -1;

  changeContactMethod(method) {
    this.props.changeContactMethod(method);
  }

  render() {
    const {t, contactCode, isStatus, ensError, contactMethod} = this.props;
    const selectedMethod = this.contactMethods.find(method => method.name === contactMethod);
    return (
      <Fragment>
        <h2 className="mb-4">{t('contactForm.contactTitle')}</h2>
        <Form>
          <FormGroup>
            {this.contactMethods.map((method, index) => (
              <CheckButton key={'contact-' + index} inline align="left"
                           onClick={() => this.changeContactMethod(method.name)}
                           active={method.name === contactMethod}>
                {method.name}
              </CheckButton>
            ))}

            <Label for="contactCode" className="d-block mt-3">{selectedMethod.label}</Label>
            <Row noGutters>
              <Col xs={isStatus ? 9 : 12}>
                <Input type="text"
                       name="contactCode"
                       id="contactCode"
                       placeholder={selectedMethod.placeholder}
                       value={contactCode}
                       onBlur={this.handleContactCodeBlur}
                       className="form-control"
                       onChange={this.handleContactCodeChange}
                       data-isStatus={this.isStatusSelected()}
                       validations={[required, isContactCode]}/>
                {ensError && (<div className="d-block invalid-feedback">{ensError}</div>)}

              </Col>
              {isStatus && <Col xs={3}>
                <Button className="px-3 float-right" color="primary"
                        onClick={(_e) => this.props.getContactCode()}>Autofill</Button>
              </Col>}
            </Row>
          </FormGroup>
          {this.isENSName(contactCode) && <p className="text-center">
            <Button color="primary" onClick={(_e) => this.props.resolveENSName(contactCode)}>
              Resolve ENS name
            </Button>
          </p>}
        </Form>

        <div className="infos-and-warnings mt-5">
          <Row noGutters className="mt-2">
            <Col xs={1} className="pr-2">
              <RoundedIcon image={checkCircleImage} bgColor="secondary" size="sm"/>
            </Col>
            <Col xs={11}>
              <p className="info text-muted"><a href="https://status.im">Status</a> is the recommended chat platform</p>
            </Col>
          </Row>
          <Row noGutters className="mt-2">
            <Col xs={1} className="pr-2">
              <RoundedIcon image={infoImageRed} bgColor="secondary" size="sm"/>
            </Col>
            <Col xs={11}>
              <p className="info text-muted">Contact details will be written on the blockchain</p>
            </Col>
          </Row>
          <Row noGutters className="mt-2">
            <Col xs={1} className="pr-2">
              <RoundedIcon image={infoImage} bgColor="secondary" size="sm"/>
            </Col>
            <Col xs={11}>
              <p className="info text-muted">Consider which method you choose as buyers and arbitrators will contact you using it</p>
            </Col>
          </Row>
        </div>
      </Fragment>
    );
  }
}

EditContactList.propTypes = {
  t: PropTypes.func,
  changeContactMethod: PropTypes.func,
  changeContactCode: PropTypes.func,
  getContactCode: PropTypes.func,
  contactCode: PropTypes.string,
  contactMethod: PropTypes.string,
  isStatus: PropTypes.bool,
  resolveENSName: PropTypes.func,
  ensError: PropTypes.string
};

export default withNamespaces()(EditContactList);
