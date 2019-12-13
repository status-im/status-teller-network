import React from 'react';
import {Modal, ModalHeader, ModalBody, ModalFooter, Button} from 'reactstrap';
import PropTypes from 'prop-types';
import {withTranslation} from "react-i18next";

const ConfirmDialog = ({t, display, onCancel, title, content, onConfirm, cancelText, confirmText}) => (
  <Modal isOpen={display} toggle={onCancel} backdrop={true}>
    <ModalHeader toggle={onCancel}>
      {title}
    </ModalHeader>
    <ModalBody>
      <p>{content}</p>
    </ModalBody>
    <ModalFooter>
      <Button onClick={onCancel}>{cancelText || t('general.cancel')}</Button>
      <Button onClick={onConfirm}>{confirmText || t('general.yes')}</Button>
    </ModalFooter>
  </Modal>
);

ConfirmDialog.defaultProps = {
  display: false
};

ConfirmDialog.propTypes = {
  t: PropTypes.func,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
  title: PropTypes.string,
  content: PropTypes.string,
  display: PropTypes.bool,
  cancelText: PropTypes.string,
  confirmText: PropTypes.string
};

export default withTranslation()(ConfirmDialog);
