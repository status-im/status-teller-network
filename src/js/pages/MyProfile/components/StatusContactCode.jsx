import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {InputGroupAddon, Input, InputGroupText, InputGroup, FormGroup, Modal, ModalHeader, ModalBody} from 'reactstrap';
import {Link} from "react-router-dom";
import {withNamespaces} from 'react-i18next';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faQrcode} from "@fortawesome/free-solid-svg-icons";
import QRCode from "qrcode.react";
import Address from "../../../components/UserInformation/Address";

class StatusContactCode extends Component {

  state = { showQRCode: false };

  toggleQRCode = () => {
    this.setState({showQRCode: !this.state.showQRCode});
  };

  render(){
    const {t, value} = this.props;
    const {showQRCode} = this.state;
    return  (
      <FormGroup className="mt-3">
        <div>
          <h3 className="d-inline-block">
            {t('statusContactCode.title')}
          </h3>
          <span className="float-right">
            <Link to="/profile/contact/edit" className="float-right">{t('statusContactCode.edit')}</Link>
          </span>
        </div>
        <InputGroup className="full-width-input white-input">
          <Input type="text" name="contactCode" className="prepend" disabled defaultValue={value}/>
          <InputGroupAddon addonType="append">
            <InputGroupText onClick={() => this.toggleQRCode()} className="bg-dark">
              <FontAwesomeIcon size="lg" icon={faQrcode}/>
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>

        <Modal isOpen={showQRCode} toggle={this.toggleQRCode}>
          <ModalHeader toggle={this.toggleQRCode}>{t('statusContactCode.title')}</ModalHeader>
          <ModalBody className="text-center">
            <QRCode value={value}/>
            <p className="overflow-hidden">
              <Address address={value}/>
            </p>
          </ModalBody>
        </Modal>

      </FormGroup>
    );
  }
}

StatusContactCode.propTypes = {
  t: PropTypes.func,
  value: PropTypes.string
};

export default withNamespaces()(StatusContactCode);
