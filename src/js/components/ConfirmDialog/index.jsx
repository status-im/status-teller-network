import React, {Component} from 'react';
import {Modal, ModalHeader, ModalBody, ModalFooter, Button} from 'reactstrap';
import PropTypes from 'prop-types';

class ConfirmDialog extends Component {

  onContinue = () => {
    this.props.onConfirm();
    this.props.onCancel();
  }

  render(){
    return <Modal isOpen={this.props.display} toggle={this.props.onCancel} backdrop={true} >
    <ModalHeader toggle={this.props.onCancel}>
      {this.props.title}
    </ModalHeader>
    <ModalBody>
      <p>{this.props.content}</p>
    </ModalBody>
    <ModalFooter>
      <Button onClick={this.props.onCancel}>Cancel</Button>
      <Button onClick={this.onContinue}>Yes</Button>
    </ModalFooter>
  </Modal>;
  }
}


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
