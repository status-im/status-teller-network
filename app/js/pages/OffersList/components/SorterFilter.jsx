import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleDown, faSortAmountDown} from "@fortawesome/free-solid-svg-icons";
import classnames from 'classnames';
import {ButtonGroup, FormGroup} from "reactstrap";
import {Typeahead} from "react-bootstrap-typeahead";

import CheckButton from '../../../ui/CheckButton';

import './SorterFilter.scss';

const FilterMenu = (props) => (
  <Fragment>
    <div className={classnames({"filter-menu-backdrop": true, "open": props.open})} onClick={props.close}/>
    <div className={classnames("filter-menu", {"open": props.open})}>
      <div className="filter-menu-content">
        <h4>Sort and filter</h4>

        <h5 className="mt-4">Sort</h5>
        <ButtonGroup vertical className="w-100">
          <CheckButton active={true}>
            Top rated
          </CheckButton>
          <CheckButton active={false}>
            Most recent
          </CheckButton>
        </ButtonGroup>

        <h5 className="mt-4">Payment method</h5>
        <ButtonGroup vertical className="w-100">
          {props.paymentMethods.map((paymentMethod, index) => (
            <CheckButton key={index}
                         onClick={() => props.setPaymentMethodFilter(index)}
                         active={index === props.paymentMethodFilter}>
              {paymentMethod}
            </CheckButton>
          ))}
        </ButtonGroup>

        <h5 className="mt-4">Country</h5>
        <FormGroup>
          <Typeahead
            options={['Canada', 'USA', 'France']}
            placeholder={'Select'}
          />
        </FormGroup>

        <h5 className="mt-4">Asset</h5>
        <FormGroup>
          <Typeahead
            options={props.tokens.map((token) => ({value: token.address, label: token.symbol}))}
            placeholder={'Select'}
            value={props.tokenFilter}
            onChange={props.setTokenFilter}
          />
        </FormGroup>
      </div>
    </div>
  </Fragment>
);

FilterMenu.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func,
  paymentMethods: PropTypes.array,
  tokens: PropTypes.array,
  setTokenFilter: PropTypes.func,
  setPaymentMethodFilter: PropTypes.func,
  tokenFilter: PropTypes.string,
  paymentMethodFilter: PropTypes.number
};

class SorterFilter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false
    };
  }

  toggleMenu = () => {
    this.setState({open: !this.state.open});
  };

  render() {
    return (<Fragment>
      <FilterMenu open={this.state.open} close={this.toggleMenu} {...this.props}/>
      <div className="sorter-select font-weight-bold px-3 py-2 bg-secondary rounded v-align-center my-3"
           onClick={this.toggleMenu}>
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
  tokens: PropTypes.array,
  setTokenFilter: PropTypes.func,
  setPaymentMethodFilter: PropTypes.func,
  tokenFilter: PropTypes.string,
  paymentMethodFilter: PropTypes.number
};

export default SorterFilter;
