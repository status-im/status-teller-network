import React from 'react';
import {Modal, ModalHeader, ModalBody, ModalFooter, Button} from 'reactstrap';
import PropTypes from 'prop-types';

const ConfirmDialog = ({display, onCancel, title, content, onConfirm}) => (
  <Modal isOpen={display} toggle={onCancel} backdrop={true} >
    <ModalHeader toggle={onCancel}>
      {title}
    </ModalHeader>
    <ModalBody>
      <p>{content}</p>
    </ModalBody>
    <ModalFooter>
      <Button onClick={onCancel}>Cancel</Button>
      <Button onClick={onConfirm}>Yes</Button>
    </ModalFooter>
  </Modal>
);

ConfirmDialog.defaultProps = {
  display: false
};

ConfirmDialog.propTypes = {
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
  title: PropTypes.string,
  content: PropTypes.string,
  display: PropTypes.bool
};

export default ConfirmDialog;
