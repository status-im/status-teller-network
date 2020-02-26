import React from 'react';
import {Modal, ModalBody, Button} from 'reactstrap';
import PropTypes from 'prop-types';

const ModalDialog = ({display, onClose, children, buttonText, hideButton, onClick}) => (
  <Modal isOpen={display} toggle={onClose} backdrop={true} className="text-center modal-dialog-centered" >
    <ModalBody>
      <div className="p-4">
      {children}
      </div>
      {!hideButton && <Button onClick={onClick || onClose} color="primary" className="m-2">{buttonText || 'Ok'}</Button>}
    </ModalBody>
  </Modal>
);

ModalDialog.defaultProps = {
  display: false,
  hideButton: false,
  onClose: () => {}
};

ModalDialog.propTypes = {
  onClose: PropTypes.func,
  onClick: PropTypes.func,
  content: PropTypes.string,
  display: PropTypes.bool,
  buttonText: PropTypes.string,
  children: PropTypes.node,
  hideButton: PropTypes.bool
};

export default ModalDialog;
