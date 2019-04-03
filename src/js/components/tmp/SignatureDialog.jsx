import React from 'react';
import {Modal, ModalHeader, ModalBody} from 'reactstrap';
import PropTypes from 'prop-types';

const SignatureDialog = (props) => <Modal isOpen={props.open} toggle={props.onClose} backdrop={true} >
    <ModalHeader toggle={props.onClose}>{props.children}</ModalHeader>
    <ModalBody>
      <textarea rows={8} cols={40} readOnly={true} defaultValue={JSON.stringify(props.message)} />
      <p>Copy this message to clipboard and send it to someone to notify payment on your behalf (?)</p>
    </ModalBody>
  </Modal>;

SignatureDialog.propTypes = {
  open: PropTypes.bool,
  children: PropTypes.node,
  message: PropTypes.object,
  onClose: PropTypes.func
};

export default SignatureDialog;
