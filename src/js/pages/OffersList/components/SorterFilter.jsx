import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {Button} from "reactstrap";
import {Typeahead, Highlighter} from "react-bootstrap-typeahead";
import {getOptionLabel} from "react-bootstrap-typeahead/lib/utils";
import {PAYMENT_METHODS} from '../../../features/metadata/constants';
import Draggable from "react-draggable";
import {withTranslation} from "react-i18next";
import {getTokenImage} from "../../../utils/images";

import SorterModal from "./Modals/SortModal";
import CurrencyModal from "./Modals/CurrencyModal";
import AmountModal from "./Modals/AmountModal";
import PaymentMethodModal from "./Modals/PaymentMethodModal";
import ContactMethodModal from "./Modals/ContactMethodModal";
import LocationModal from "./Modals/LocationModal";

import { ReactComponent as ListIcon } from '../../../../images/list.svg';
import { ReactComponent as LocationIcon } from '../../../../images/location.svg';
import { ReactComponent as MoneyIcon } from '../../../../images/money-hand.svg';
import { ReactComponent as CurrencyIcon } from '../../../../images/dollar.svg';
import { ReactComponent as TransferIcon } from '../../../../images/transfer.svg';
import { ReactComponent as ChatIcon } from '../../../../images/read-chat.svg';
import cryptoIcons from '../../../../images/cryptoIcons.svg';
import ArrowDown from '../../../../images/arrow-down.svg';

import './SorterFilter.scss';

const defaultState = {
  sortOpen: false,
  paymentMethodOpen: false,
  currencyModalOpen: false,
  amountModalOpen: false,
  contactMethodModalOpen: false,
  locationOpen: false
};
class SorterFilter extends Component {
  constructor(props) {
    super(props);

    this.state = defaultState;
  }

  closeMenu = () => {
    this.setState(defaultState);
  };

  openSort = () => {
    this.setState({sortOpen: true});
  };

  openLocation = () => {
    this.setState({locationOpen: true});
  };

  openPaymentMethod = () => {
    this.setState({paymentMethodOpen: true});
  };

  openCurrencyModal = () => {
    this.setState({currencyModalOpen: true});
  };

  openAmountModal = () => {
    this.setState({amountModalOpen: true});
  };

  contactMethodModal = () => {
    this.setState({contactMethodModalOpen: true});
  };

  render() {
    const t = this.props.t;
    return (<Fragment>
      <div className="tokenFilter-container position-relative">
        <img src={cryptoIcons} alt="crypto icons" className="crypto-icons"/>
        <Typeahead
          id="tokenFilter"
          className="filter-modal"
          options={this.props.tokens.map((token) => ({value: token.address, label: token.symbol}))}
          placeholder={t('filter.searchCryptos')}
          value={this.props.tokenFilter}
          onChange={this.props.setTokenFilter}
          ref={(typeahead) => {
            this.typeahead = typeahead;
          }}
          onFocus={() => { this.isTokenFilterActive = true; }}
          renderMenuItemChildren={(option, props, idx) => {
            const symbol = getOptionLabel(option, props.labelKey);
            let nbOffersForToken = 0;
            this.props.offers.forEach(offer => {
              if (offer.token.symbol === symbol) {
                nbOffersForToken++;
              }
            });
            return (
              <div className={classnames("mt-2", {'border-bottom pb-2': idx !== this.props.tokens.length - 1})}>
                <img src={getTokenImage(symbol)} alt={symbol + ' icon'} className="asset-image mr-2 float-left"/>
                {this.props.tokens.find(token => token.symbol === symbol).name}
                <span className="text-muted ml-2 d-inline-block mb-2">
              <Highlighter search={props.text}>
                {symbol}
              </Highlighter>
              </span>
                <span className="text-muted float-right">
                ({nbOffersForToken})
              </span>
              </div>
            );
          }}
        />
        <img src={ArrowDown} alt="" className="arrow-down clickable"
          onClick={() => {
            if(this.typeahead){
              if(this.isTokenFilterActive){
                this.typeahead.blur();
                this.isTokenFilterActive = false;
              } else {
                this.typeahead.focus();
                this.typeahead.getInput().click();
                this.isTokenFilterActive = true;
              }
            }
          }}
        />
      </div>
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
              <LocationIcon className="mr-2"/>{this.props.location ? this.props.location : t('filter.location')}
            </Button>
            <Button className={classnames("p-2 px-3 mr-3", {inactive: this.props.paymentMethodFilter === -1})} onClick={this.openPaymentMethod}>
              <MoneyIcon className="mr-2"/>{this.props.paymentMethodFilter !== -1 ? PAYMENT_METHODS[this.props.paymentMethodFilter] : t('filter.paymentMethod')}
            </Button>
            <Button className={classnames("p-2 px-3 mr-3", {inactive: !this.props.selectedCurrency})} onClick={this.openCurrencyModal}>
              <CurrencyIcon className="mr-2"/>{this.props.selectedCurrency ? this.props.selectedCurrency : t('filter.currency')}
            </Button>
            {this.props.selectedCurrency && <Button className={classnames("p-2 px-3 mr-3", {inactive: this.props.amountFilter === -1})} onClick={this.openAmountModal}>
              <TransferIcon className="mr-2"/>{this.props.amountFilter !== -1 ? `${this.props.amountFilter} ${this.props.selectedCurrency}` : t('filter.amount')}
            </Button>}
            <Button className={classnames("p-2 px-3 mr-3", {inactive: !this.props.contactMethodFilter})} onClick={this.contactMethodModal}>
              <ChatIcon className="mr-2"/>{this.props.contactMethodFilter ? this.props.contactMethodFilter : t('filter.contactMethod')}
            </Button>
          </div>
        </Draggable>
      </div>

      {this.state.sortOpen &&
      <SorterModal onClose={this.closeMenu} setSortType={this.props.setSortType}
                   sortType={this.props.sortType} sortTypes={this.props.sortTypes}/>}

      {this.state.locationOpen &&
      <LocationModal onClose={this.closeMenu} setLocation={this.props.setLocation}
                     location={this.props.location}/>}

      {this.state.paymentMethodOpen &&
      <PaymentMethodModal onClose={this.closeMenu}
                          paymentMethodFilter={this.props.paymentMethodFilter}
                          setPaymentMethodFilter={this.props.setPaymentMethodFilter}/>}

      {this.state.currencyModalOpen &&
      <CurrencyModal onClose={this.closeMenu} changeCurrency={this.props.changeCurrency} offers={this.props.offers}
                     currencies={this.props.currencies} selected={this.props.selectedCurrency}/>}

      {this.state.amountModalOpen &&
      <AmountModal onClose={this.closeMenu} amount={this.props.amountFilter} setAmount={this.props.setAmountFilter}/>}

      {this.state.contactMethodModalOpen &&
      <ContactMethodModal onClose={this.closeMenu} contactMethodFilter={this.props.contactMethodFilter} setContactMethodFilter={this.props.setContactMethodFilter} offers={this.props.offers}/>}
    </Fragment>);
  }
}

SorterFilter.propTypes = {
  t: PropTypes.func,
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
  paymentMethodFilter: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  sortType: PropTypes.number,
  currencies: PropTypes.array,
  changeCurrency: PropTypes.func,
  selectedCurrency: PropTypes.string,
  amountFilter: PropTypes.number,
  contactMethodFilter: PropTypes.string,
  setContactMethodFilter: PropTypes.func,
  offers: PropTypes.array,
  setAmountFilter: PropTypes.func
};

export default withTranslation()(SorterFilter);
