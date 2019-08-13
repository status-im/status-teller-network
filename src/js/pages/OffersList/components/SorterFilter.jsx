import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFilter} from "@fortawesome/free-solid-svg-icons";
import classnames from 'classnames';
import {ButtonGroup, FormGroup, Input, Button} from "reactstrap";
import {Typeahead} from "react-bootstrap-typeahead";
import {PAYMENT_METHODS, POPULAR_PAYMENT_METHODS_INDEXES} from '../../../features/metadata/constants';
import CheckButton from '../../../ui/CheckButton';

import './SorterFilter.scss';

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

          <div className="filter-menu-content">
            <h5 className="mt-4">Cryptocurrency</h5>
            <FormGroup>
              <Typeahead
                id="tokenFilter"
                options={props.tokens.map((token) => ({value: token.address, label: token.symbol}))}
                placeholder={'Select'}
                value={props.tokenFilter}
                onChange={props.setTokenFilter}
              />
            </FormGroup>

            <h5 className="mt-4">Location</h5>
            <FormGroup>
              <Input type="text" placeholder="Enter an address, postal code, city, etc."
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
            <ButtonGroup vertical className="w-100">
              {Object.keys(PAYMENT_METHODS).filter(x => POPULAR_PAYMENT_METHODS_INDEXES.indexOf(parseInt(x, 10)) === -1).map((index) => (
                <CheckButton active={index === props.paymentMethodFilter}
                    key={'paymentMethod-' + index}
                    onClick={(_e) => props.setPaymentMethodFilter(index)}>
                {PAYMENT_METHODS[index]}
                </CheckButton>
              ))}
            </ButtonGroup>

            <Button color="primary" onClick={props.close} className="mx-auto mt-2 d-block">Apply filters</Button>
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
  setPaymentMethodFilter: PropTypes.func,
  setSortType: PropTypes.func,
  setLocation: PropTypes.func,
  clear: PropTypes.func,
  tokenFilter: PropTypes.string,
  paymentMethodFilter: PropTypes.number,
  sortType: PropTypes.number
};

class SorterFilter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false
    };
  }

  closeMenu = () => {
    this.setState({open: false});
  };

  openMenu = () => {
    this.setState({open: true});
  };

  render() {
    return (<Fragment>
      <FilterMenu open={this.state.open} close={this.closeMenu} {...this.props}/>
      <span className={classnames("filter-icon rounded d-inline-block text-center float-right py-3 clickable", {
        'bg-secondary text-primary': !this.props.hasFilter,
        'bg-primary text-secondary': this.props.hasFilter
      })} onClick={this.openMenu}>
        <FontAwesomeIcon icon={faFilter}/>
      </span>
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
