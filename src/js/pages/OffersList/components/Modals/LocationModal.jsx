import React, {Component} from "react";
import {Button, FormGroup, Modal, ModalBody} from "reactstrap";
import ClearButton from "../ClearButton";
import PropTypes from "prop-types";
import {withTranslation} from "react-i18next";

class LocationModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: props.location || ''
    };

    this.locationInput = React.createRef();
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.locationInput && this.locationInput.current) {
        // Focus after the element in mounted
        this.locationInput.current.focus();
      }
    }, 500);
  }

  onChange = (e) => {
    this.setState({location: e.target.value});
  };

  render() {
    const {t, onClose, setLocation} = this.props;
    return (<Modal isOpen={true} toggle={onClose} backdrop={true} className="filter-modal">
      <ClearButton close={onClose} onClear={() =>  setLocation('')}/>
      <ModalBody className="mt-3">
        <FormGroup className="text-center pt-4">
          <input className="form-control mb-3" type="text" placeholder={t('filter.locationPlaceholder')}
                 autoFocus
                 ref={this.locationInput}
                 value={this.state.location}
                 onChange={this.onChange}
                 onKeyUp={(e) => {
                   if (e.key === 'Enter') {
                     setLocation(e.target.value);
                     onClose();
                   }
                 }}/>
          <div className="text-right">
            <Button onClick={() => setLocation(this.state.location)} color="primary">{t('filter.apply')}</Button>
          </div>
        </FormGroup>
      </ModalBody>
    </Modal>);
  }
}

LocationModal.propTypes = {
  t: PropTypes.func,
  onClose: PropTypes.func,
  location: PropTypes.string,
  setLocation: PropTypes.func
};

export default withTranslation()(LocationModal);
