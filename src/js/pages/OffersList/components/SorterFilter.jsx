import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {ButtonGroup, FormGroup, Input, Button, ModalBody, Modal} from "reactstrap";
import {Typeahead} from "react-bootstrap-typeahead";
import {PAYMENT_METHODS, POPULAR_PAYMENT_METHODS_INDEXES} from '../../../features/metadata/constants';
import {DialogOptions} from "../../../constants/contactMethods";
import CheckButton from '../../../ui/CheckButton';

import { ReactComponent as ListIcon } from '../../../../images/list.svg';
import { ReactComponent as FlagIcon } from '../../../../images/flag.svg';
import { ReactComponent as MoneyIcon } from '../../../../images/money-hand.svg';
import { ReactComponent as TransferIcon } from '../../../../images/transfer.svg';
import { ReactComponent as ChatIcon } from '../../../../images/read-chat.svg';

import './SorterFilter.scss';
import Draggable from "react-draggable";

class FilterMenu extends Component {
  setLocation = (e) => {
    this.props.setLocation(e.target.value);
  };

  onKeyUp = (e) => {
    if (e.key === 'Enter') {
      this.setLocation(e);
    }
  };

  render() {
    const props = this.props;
    return (
      <Fragment>
        <div className={classnames({"filter-menu-backdrop": true, "open": props.open})} onClick={props.close}/>
        <div className={classnames("filter-menu", {"open": props.open})}>
          <Button color="link" className="clear-all-btn p-0" onClick={props.clear}>Clear all</Button>

          <div className="filter-menu-content mt-4 pr-3">
            <h5>Cryptocurrency</h5>
            <FormGroup>
              <Typeahead
                id="tokenFilter"
                options={props.tokens.map((token) => ({value: token.address, label: token.symbol}))}
                placeholder={'Search cryptocurrencies'}
                value={props.tokenFilter}
                onChange={props.setTokenFilter}
              />
            </FormGroup>

            <h5>Communication method</h5>
            <FormGroup>
              <Typeahead
                id="commFilter"
                options={Object.keys(DialogOptions)}
                placeholder={'Filter communication method'}
                value={props.commFilter}
                onChange={props.setCommFilter}
              />
              <CheckButton onClick={props.toggleCommunicationMethod}
                           active={props.showCommunicationMethod}>
                Show Communication method
              </CheckButton>
            </FormGroup>

            <h5 className="mt-4">Location</h5>
            <FormGroup>
              <Input type="text" placeholder="Enter a city, state, etc."
                     onBlur={this.setLocation}
                     onKeyUp={this.onKeyUp}/>
            </FormGroup>

            <h5 className="mt-4">Sort</h5>
            <ButtonGroup vertical className="w-100">
              {props.sortTypes.map((sortType, index) => (
                <CheckButton key={'sort-' + index}
                             onClick={() => {
                               props.setSortType(index);
                             }}
                             active={index === props.sortType}>
                  {sortType}
                </CheckButton>
              ))}
            </ButtonGroup>

            <h5 className="mt-4">Payment method</h5>
            <span className="text-muted text-small">Popular</span>
            <ButtonGroup vertical className="w-100">
              {POPULAR_PAYMENT_METHODS_INDEXES.map((index) => (
                <CheckButton active={index === props.paymentMethodFilter}
                            key={'paymentMethod-' + index}
                            onClick={(_e) => props.setPaymentMethodFilter(index)}>
                  {PAYMENT_METHODS[index]}
                </CheckButton>
              ))}
            </ButtonGroup>

            <span className="text-muted text-small mt-3">All payment methods (A-Z)</span>
            <ButtonGroup vertical className="w-100 pb-3">
              {Object.keys(PAYMENT_METHODS).filter(x => POPULAR_PAYMENT_METHODS_INDEXES.indexOf(parseInt(x, 10)) === -1).map((index) => (
                <CheckButton active={index === props.paymentMethodFilter}
                    key={'paymentMethod-' + index}
                    onClick={(_e) => props.setPaymentMethodFilter(index)}>
                {PAYMENT_METHODS[index]}
                </CheckButton>
              ))}
            </ButtonGroup>

            <div className="filter-button">
              <Button color="primary" onClick={props.close} className="mx-auto mt-2 d-block">Apply filters</Button>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

FilterMenu.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func,
  paymentMethods: PropTypes.array,
  sortTypes: PropTypes.array,
  tokens: PropTypes.array,
  setTokenFilter: PropTypes.func,
  setCommFilter: PropTypes.func,
  setPaymentMethodFilter: PropTypes.func,
  setSortType: PropTypes.func,
  setLocation: PropTypes.func,
  clear: PropTypes.func,
  tokenFilter: PropTypes.string,
  commFilter: PropTypes.string,
  paymentMethodFilter: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  sortType: PropTypes.number,
  showCommunicationMethod: PropTypes.bool,
  toggleCommunicationMethod: PropTypes.func
};

const SorterModal = ({onClose, sortTypes, setSortType, sortType}) => (
  <Modal isOpen={true} toggle={onClose} backdrop={true}>
    <ModalBody>
      <ButtonGroup vertical className="w-100">
        {sortTypes.map((_sortType, index) => (
          <CheckButton key={'sort-' + index}
                       onClick={() => {
                         setSortType(index);
                         onClose();
                       }}
                       active={index === sortType}>
            {_sortType}
          </CheckButton>
        ))}
      </ButtonGroup>
    </ModalBody>
  </Modal>
);

SorterModal.propTypes = {
  onClose: PropTypes.func,
  setSortType: PropTypes.func,
  sortTypes: PropTypes.array,
  sortType: PropTypes.number
};

class LocationModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: props.location || ''
    };
  }

  componentDidMount() {
    this.locationInput.focus();
  }

  onChange = (e) => {
    this.setState({location: e.target.value});
  };

  render() {
    const {onClose, setLocation} = this.props;
    return (<Modal isOpen={true} toggle={onClose} backdrop={true}>
      <ModalBody>
        <FormGroup className="text-center pt-4">
          <input className="form-control" type="text" placeholder="Enter a city, state, etc."
                 ref={(input) => { this.locationInput = input; }}
                 autoFocus
                 value={this.state.location}
                 onChange={this.onChange}
                 onKeyUp={(e) => {
                   if (e.key === 'Enter') {
                     setLocation(e.target.value);
                     onClose();
                   }
                 }}/>
          <Button onClick={() => {
            setLocation('');
            onClose();
          }} className="mt-3 d-inline-block mr-3">Clear</Button>
          <Button color="primary" onClick={() => {
            setLocation(this.state.location);
            onClose();
          }} className="mt-3 d-inline-block">Apply</Button>
        </FormGroup>
      </ModalBody>
    </Modal>);
  }
}

LocationModal.propTypes = {
  onClose: PropTypes.func,
  location: PropTypes.string,
  setLocation: PropTypes.func
};

class SorterFilter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sortOpen: false,
      locationOpen: false
    };
  }

  closeMenu = () => {
    this.setState({
      sortOpen: false,
      locationOpen: false
    });
  };

  openSort = () => {
    this.setState({sortOpen: true});
  };

  openLocation = () => {
    this.setState({locationOpen: true});
  };

  render() {
    return (<Fragment>
      <Typeahead
        id="tokenFilter"
        options={this.props.tokens.map((token) => ({value: token.address, label: token.symbol}))}
        placeholder={'Search cryptocurrencies'}
        value={this.props.tokenFilter}
        onChange={this.props.setTokenFilter}
      />
      <div className="filter-menu-slider-container position-relative">
        <Draggable
          axis="x"
          handle=".filter-menu-slider"
          defaultPosition={{x: 0, y: 0}}
          grid={[25, 25]}
          bounds={{left: -450, right: 0}}
          scale={1}>
          <div className="filter-menu-slider mt-3">
            <Button className="p-2 px-3 mr-3" onClick={this.openSort}>
              <ListIcon className="mr-2"/>{this.props.sortTypes[this.props.sortType]}
            </Button>
            <Button className={classnames("p-2 px-3 mr-3", {inactive: !this.props.location})} onClick={this.openLocation}>
              <FlagIcon className="mr-2"/>Location
            </Button>
            <Button className="p-2 px-3 mr-3 inactive"><MoneyIcon className="mr-2"/>Payment method</Button>
            <Button className="p-2 px-3 mr-3 inactive"><TransferIcon className="mr-2"/>Amount</Button>
            <Button className="p-2 px-3 mr-3 inactive"><ChatIcon className="mr-2"/>Contact method</Button>
          </div>
        </Draggable>
      </div>

      {this.state.sortOpen &&
      <SorterModal onClose={this.closeMenu} setSortType={this.props.setSortType}
                   sortType={this.props.sortType} sortTypes={this.props.sortTypes}/>}

      {this.state.locationOpen &&
      <LocationModal onClose={this.closeMenu} setLocation={this.props.setLocation} location={this.props.location}/>}
    </Fragment>);
  }
}

SorterFilter.propTypes = {
  paymentMethods: PropTypes.array,
  sortTypes: PropTypes.array,
  tokens: PropTypes.array,
  location: PropTypes.string,
  setLocation: PropTypes.func,
  setTokenFilter: PropTypes.func,
  setPaymentMethodFilter: PropTypes.func,
  setSortType: PropTypes.func,
  clear: PropTypes.func,
  tokenFilter: PropTypes.string,
  paymentMethodFilter: PropTypes.number,
  sortType: PropTypes.number,
  hasFilter: PropTypes.bool
};

export default SorterFilter;
