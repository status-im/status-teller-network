import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {ButtonGroup, FormGroup, Input, Button} from "reactstrap";
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

class SorterFilter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false
    };
  }

  closeMenu = () => {
  };

  openMenu = () => {
    this.setState({open: true});
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
            <Button className="p-2 px-3 mr-3"><ListIcon className="mr-2"/>Most popular</Button>
            <Button className="p-2 px-3 mr-3 inactive"><FlagIcon className="mr-2"/>Country</Button>
            <Button className="p-2 px-3 mr-3 inactive"><MoneyIcon className="mr-2"/>Payment method</Button>
            <Button className="p-2 px-3 mr-3 inactive"><TransferIcon className="mr-2"/>Amount</Button>
            <Button className="p-2 px-3 mr-3 inactive"><ChatIcon className="mr-2"/>Contact method</Button>
          </div>
        </Draggable>
      </div>
    </Fragment>);
  }
}

SorterFilter.propTypes = {
  paymentMethods: PropTypes.array,
  sortTypes: PropTypes.array,
  tokens: PropTypes.array,
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
