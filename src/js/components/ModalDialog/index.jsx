import React from 'react';
import {Modal, ModalBody, Button} from 'reactstrap';
import PropTypes from 'prop-types';

const ModalDialog = ({display, onClose, children, buttonText}) => (
  <Modal isOpen={display} toggle={onClose} backdrop={true} className="text-center modal-dialog-centered" >
    <ModalBody>
      <div className="p-4">
      {children}
      </div>
      <Button onClick={onClose} className="btn-primary m-2">{buttonText || 'Ok'}</Button>
    </ModalBody>
  </Modal>
);

ModalDialog.defaultProps = {
  display: false
};

ModalDialog.propTypes = {
  onClose: PropTypes.func,
  content: PropTypes.string,
  display: PropTypes.bool,
  buttonText: PropTypes.string
};

export default ModalDialog;
