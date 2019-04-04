import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleDown, faSortAmountDown} from "@fortawesome/free-solid-svg-icons";
import classnames from 'classnames';
import {ButtonGroup, FormGroup, Input} from "reactstrap";
import {Typeahead} from "react-bootstrap-typeahead";

import CheckButton from '../../../ui/CheckButton';

import './SorterFilter.scss';

class FilterMenu extends Component {
  setLocation = (e) => {
    this.props.setLocation(e.target.value);
    this.props.close();
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
          <div className="filter-menu-content">
            <h4>Sort and filter</h4>

            <h5 className="mt-4">Sort</h5>
            <ButtonGroup vertical className="w-100">
              {props.sortTypes.map((sortType, index) => (
                <CheckButton key={'sort-' + index}
                             onClick={() => {
                               props.setSortType(index);
                               props.close();
                             }}
                             active={index === props.sortType}>
                  {sortType}
                </CheckButton>
              ))}
            </ButtonGroup>

            <h5 className="mt-4">Payment method</h5>
            <ButtonGroup vertical className="w-100">
              {props.paymentMethods.map((paymentMethod, index) => (
                <CheckButton key={'paymentMethod' + index}
                             onClick={() => {
                               props.setPaymentMethodFilter(index);
                               props.close();
                             }}
                             active={index === props.paymentMethodFilter}>
                  {paymentMethod}
                </CheckButton>
              ))}
            </ButtonGroup>

            <h5 className="mt-4">Location</h5>
            <FormGroup>
              <Input type="text" placeholder="Enter an address, postal code, city, etc."
                     onBlur={this.setLocation}
                     onKeyUp={this.onKeyUp}/>
            </FormGroup>

            <h5 className="mt-4">Asset</h5>
            <FormGroup>
              <Typeahead
                id="tokenFilter"
                options={props.tokens.map((token) => ({value: token.address, label: token.symbol}))}
                placeholder={'Select'}
                value={props.tokenFilter}
                onChange={props.setTokenFilter}
                onMenuToggle={(isOpen) => {
                  if (!isOpen) props.close();
                }}
              />
            </FormGroup>
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
      <div className="sorter-select font-weight-bold px-3 py-2 bg-secondary rounded v-align-center my-3"
           onClick={this.openMenu}>
        <span className="sort-icon text-white rounded-circle d-inline-block text-center p-2 mr-2">
          <FontAwesomeIcon icon={faSortAmountDown}/>
        </span> Sort and filter <span className="float-right pt-1"><FontAwesomeIcon size="2x"
                                                                                    icon={faAngleDown}/></span>
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
  tokenFilter: PropTypes.string,
  paymentMethodFilter: PropTypes.number,
  sortType: PropTypes.number
};

export default SorterFilter;
