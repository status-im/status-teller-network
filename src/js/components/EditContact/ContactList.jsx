import React, {Component, Fragment} from 'react';
import {FormGroup, Button, Label, Row, Col} from 'reactstrap';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import {Trans, withTranslation} from "react-i18next";
import PropTypes from 'prop-types';
import {required, isContactCode, validENS} from "./validators";
import CheckButton from "../../ui/CheckButton";
import RoundedIcon from "../../ui/RoundedIcon";
import {STATUS} from '../../constants/contactMethods';
import infoImageRed from '../../../images/info-red.svg';
import infoImage from '../../../images/small-info.svg';
import checkCircleImage from '../../../images/check-circle.svg';

const domain = ".stateofus.eth";

class EditContactList extends Component {
  constructor(props) {
    super(props);
    this.contactMethods = [
      {name: STATUS, label: props.t('contactForm.statusKeyLabel'), placeholder: props.t('contactForm.statusPlaceholder')},
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
    const contactCode = e.target.value.toLowerCase();
    if (!this.isStatusSelected()) {
      this.props.changeContactCode(contactCode);
      return;
    }
    if (validENS(contactCode) && !this.isStatusENSDomain(contactCode) && !this.isENSName(contactCode)) {
      this.props.changeContactCode(contactCode + domain);
    }
  };

  isENSName = (contactCode) => contactCode && contactCode.endsWith(".eth");

  isStatusENSDomain = (contactCode) => contactCode && contactCode.indexOf(domain) > -1;

  changeContactMethod(method) {
    this.props.changeContactMethod(method);
  }

  renderRow(text, image, color) {
    return <Row noGutters className="mt-2 mb-3 flex-row flex-nowrap">
      <span>
        <RoundedIcon image={image} bgColor={color} size="sm" className="m-0 mr-2"/>
      </span>
      <span className="info text-muted">{text}</span>
    </Row>;
  }

  render() {
    const {t, contactCode, isStatus, ensError, contactMethod} = this.props;
    const selectedMethod = this.contactMethods.find(method => method.name === (contactMethod || STATUS));
    return (
      <Fragment>
        <h2 className="mb-4">{t('contactForm.contactTitle')}</h2>
        <Form onSubmit={(e) => e.preventDefault()}>
          <FormGroup>
            {this.contactMethods.map((method, index) => (
              <CheckButton key={'contact-' + index} inline align="left"
                           onClick={() => this.changeContactMethod(method.name)}
                           active={method.name === (contactMethod || STATUS)}>
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
                       data-is-status={this.isStatusSelected()}
                       validations={[required, isContactCode]}/>
                {ensError && (<div className="d-block invalid-feedback">{ensError}</div>)}

              </Col>
              {isStatus && <Col xs={3}>
                <Button className="px-3 float-right" color="primary"
                        onClick={(_e) => this.props.getContactCode()}>{t('contactForm.autofill')}</Button>
              </Col>}
            </Row>
          </FormGroup>
          {contactMethod === STATUS && this.isENSName(contactCode) && <p className="text-center">
            <Button color="primary" onClick={(_e) => this.props.resolveENSName(contactCode)}>
              {t('contactForm.resolveENS')}
            </Button>
          </p>}
        </Form>

        <div className="infos-and-warnings mt-4">
          {this.renderRow(<Trans i18nKey="contactForm.recommendedPlatform">
            <a href="https://status.im">Status</a> is the recommended chat platform
          </Trans>, checkCircleImage, 'secondary')}

          {this.renderRow(t('contactForm.contactDetailsWarning'), infoImageRed, 'red')}

          {this.renderRow(t('contactForm.consider'), infoImage, 'secondary')}
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

export default withTranslation()(EditContactList);
