import React, {Component} from "react";
import {Button, FormGroup, Label, Modal, ModalBody} from "reactstrap";
import ClearButton from "../ClearButton";
import PropTypes from "prop-types";
import {withTranslation} from "react-i18next";

class AmountModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: props.amount === -1 ? '' : props.amount
    };

    this.amountInput = React.createRef();
  }

  componentDidUpdate() {
    this.amountInput.current.focus();
  }

  onChange = (e) => {
    this.setState({amount: e.target.value});
  };

  render() {
    const {t, onClose, setAmount} = this.props;
    return (
      <Modal isOpen={true} toggle={onClose} backdrop={true} className="filter-modal">
        <ClearButton close={onClose} onClear={() => setAmount(-1)}/>
        <ModalBody>
          <FormGroup className="pt-4">
            <Label for="amountLabel">{t('filter.amount')}</Label>
            <input id="amountLabel" className="form-control mb-3" type="text" placeholder="0"
                   ref={this.amountInput}
                   autoFocus
                   value={this.state.amount}
                   onChange={this.onChange}
                   onKeyUp={(e) => {
                     if (e.key === 'Enter') {
                       setAmount(e.target.value);
                       onClose();
                     }
                   }}/>
            <div className="text-right">
              <Button onClick={() => {
                setAmount(this.state.amount);
                onClose();
              }} color="primary">{t('filter.apply')}</Button>
            </div>
          </FormGroup>
        </ModalBody>
      </Modal>
    );
  }
}

AmountModal.propTypes = {
  t: PropTypes.func,
  onClose: PropTypes.func,
  setAmount: PropTypes.func,
  amount: PropTypes.number
};

export default withTranslation()(AmountModal);
