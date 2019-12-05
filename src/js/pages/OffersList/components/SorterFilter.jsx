import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {ButtonGroup, FormGroup, Button, ModalBody, Modal, Label} from "reactstrap";
import {Typeahead, Highlighter} from "react-bootstrap-typeahead";
import {getOptionLabel} from "react-bootstrap-typeahead/lib/utils";
import {PAYMENT_METHODS, POPULAR_PAYMENT_METHODS_INDEXES} from '../../../features/metadata/constants';
import {DialogOptions, DialogOptionsIcons} from "../../../constants/contactMethods";
import CheckButton from '../../../ui/CheckButton';
import Draggable from "react-draggable";
import Separator from "../../MyProfile/components/Separator";
import {withNamespaces} from "react-i18next";
import {getTokenImage} from "../../../utils/images";

import { ReactComponent as ListIcon } from '../../../../images/list.svg';
import { ReactComponent as FlagIcon } from '../../../../images/flag.svg';
import { ReactComponent as MoneyIcon } from '../../../../images/money-hand.svg';
import { ReactComponent as CurrencyIcon } from '../../../../images/dollar.svg';
import { ReactComponent as TransferIcon } from '../../../../images/transfer.svg';
import { ReactComponent as ChatIcon } from '../../../../images/read-chat.svg';

import './SorterFilter.scss';
import RoundedIcon from "../../../ui/RoundedIcon";
import {stringToContact} from "../../../utils/strings";

const ClearAndApplyButtons = ({onClear, onApply, close}) => (
  <div className="mb-2 mt-2 text-center">
    <Button onClick={() => {
      if (onClear) {
        onClear();
      }
      close();
    }} className="mr-3">Clear</Button>
    <Button onClick={() => {
      if (onApply) {
        onApply();
      }
      close();
    }} color="primary">Apply</Button>
  </div>
);

ClearAndApplyButtons.propTypes = {
  onClear: PropTypes.func,
  onApply: PropTypes.func,
  close: PropTypes.func
};

const ClearButton = ({onClear, close}) => (
    <Button onClick={() => {
      console.log('ALLO?');
      if (onClear) {
        onClear();
      }
      close();
    }} className="px-2 py-0 clear-button clickable">Clear selection</Button>
);

ClearButton.propTypes = {
  onClear: PropTypes.func,
  close: PropTypes.func
};

const SorterModal = ({onClose, sortTypes, setSortType, sortType}) => (
  <Modal isOpen={true} toggle={onClose} backdrop={true} className="filter-modal">
    <ModalBody>
      <ButtonGroup vertical className="w-100">
        {sortTypes.map((_sortType, index) => (
          <Fragment key={'sort-' + index}>
            <CheckButton onClick={() => {
              setSortType(index);
              onClose();
            }} active={index === sortType}>
              {_sortType}
            </CheckButton>
            {index !== sortTypes.length - 1 && <Separator className="mb-2"/>}
          </Fragment>
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

const CurrencyModal = ({t, onClose, selected, currencies, changeCurrency, offers}) => {
  const defaultSelectedValue = [];
  if (selected) {
    const currency = currencies.find(x => x.id === selected);
    defaultSelectedValue.push(currency);
  }
  return (
    <Modal isOpen={true} toggle={onClose} backdrop={true} className="filter-modal">
      <ClearButton onClear={() => changeCurrency('')} close={onClose}/>
      <ModalBody>
        <Typeahead className="mb-3 mt-5"
                   id="fiatSelector"
                   onChange={(items) => {
                     if (items.length) {
                       const item = items[0];
                       changeCurrency(item.id);
                     }
                     onClose();
                   }}
                   options={currencies}
                   labelKey="id"
                   placeholder={t("fiatSelectorForm.placeholder")}
                   onInputChange={(text) => {
                     const symbol = currencies.find(x => x.label === text);
                     if (symbol) {
                       changeCurrency(symbol.id);
                     }
                   }}
                   submitFormOnEnter={true}
                   emptyLabel={t("fiatSelectorForm.emptyLabel")}
                   defaultSelected={defaultSelectedValue}
                   renderMenuItemChildren={(option, _props, idx) => {
                     const currency = getOptionLabel(option, _props.labelKey);
                     let nbOffersForCurrency = 0;

                     offers.forEach(offer => {
                       if (offer.currency === currency) {
                         nbOffersForCurrency++;
                       }
                     });

                     return (<div className="mt-2">
                       <RoundedIcon bgColor="blue" text={option.symbol} className="d-inline-block mr-3" size="md"/>
                       <Highlighter search={_props.text}>
                         {currency}
                       </Highlighter>
                       <span className="text-muted ml-2 d-inline-block mb-2">
                        {option.label}
                     </span>
                       <span className="text-muted float-right mt-1">
                       ({nbOffersForCurrency})
                     </span>
                       {idx !== currencies.length - 1 && <Separator/>}
                     </div>);
                   }}
        />
      </ModalBody>
    </Modal>
  );
};

CurrencyModal.propTypes = {
  t: PropTypes.func,
  onClose: PropTypes.func,
  changeCurrency: PropTypes.func,
  currencies: PropTypes.array,
  selected: PropTypes.string,
  offers: PropTypes.array
};

class AmountModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: props.amount === -1 ? '' : props.amount
    };
  }

  componentDidMount() {
    this.amountInput.focus();
  }

  onChange = (e) => {
    this.setState({amount: e.target.value});
  };

  render() {
    const {onClose, setAmount} = this.props;
    return (
      <Modal isOpen={true} toggle={onClose} backdrop={true} className="filter-modal">
        <ClearButton close={onClose} onClear={() => setAmount(-1)}/>
        <ModalBody>
          <FormGroup className="pt-4">
            <Label for="amountLabel">Amount</Label>
            <input id="amountLabel" className="form-control mb-3" type="text" placeholder="0"
                   ref={(input) => {
                     this.amountInput = input;
                   }}
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
              }} color="primary">Apply</Button>
            </div>
          </FormGroup>
        </ModalBody>
      </Modal>
    );
  }
}

AmountModal.propTypes = {
  onClose: PropTypes.func,
  setAmount: PropTypes.func,
  amount: PropTypes.number
};

const PaymentMethodModal = ({onClose, paymentMethodFilter, setPaymentMethodFilter}) => (
  <Modal isOpen={true} toggle={onClose} backdrop={true} className="filter-modal">
    <ClearButton close={onClose} onClear={() =>  setPaymentMethodFilter(-1)}/>
    <ModalBody className="mt-4">
      <p className="text-muted text-small mb-0">Popular</p>
      <ButtonGroup vertical className="w-100">
        {POPULAR_PAYMENT_METHODS_INDEXES.map((index) => (
          <Fragment key={'paymentMethod-' + index}>
            <CheckButton active={index === paymentMethodFilter} className="mt-2 mb-0"
                         onClick={(_e) => {
                           setPaymentMethodFilter(index);
                           onClose();
                         }}>
              {PAYMENT_METHODS[index]}
            </CheckButton>
            <Separator/>
          </Fragment>
        ))}
      </ButtonGroup>

      <p className="text-muted text-small mt-3 mb-0">All payment methods (A-Z)</p>
      <ButtonGroup vertical className="w-100 pb-3">
        {Object.keys(PAYMENT_METHODS).filter(x => POPULAR_PAYMENT_METHODS_INDEXES.indexOf(parseInt(x, 10)) === -1).map((index) => (
          <Fragment key={'paymentMethod-' + index}>
            <CheckButton active={index === paymentMethodFilter}
                         key={'paymentMethod-' + index}
                         onClick={(_e) => {
                           setPaymentMethodFilter(index);
                           onClose();
                         }}>
              {PAYMENT_METHODS[index]}
            </CheckButton>
            <Separator/>
          </Fragment>
        ))}
      </ButtonGroup>
    </ModalBody>
  </Modal>
);

PaymentMethodModal.propTypes = {
  onClose: PropTypes.func,
  paymentMethodFilter:  PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  setPaymentMethodFilter: PropTypes.func
};

const ContactMethodModal = ({onClose, contactMethodFilter, setContactMethodFilter, offers}) => (
  <Modal isOpen={true} toggle={onClose} backdrop={true} className="filter-modal">
    <ClearButton onClear={() => setContactMethodFilter('')} close={onClose}/>
    <ModalBody className="pb-4 mt-4 ">
      <ButtonGroup vertical className="w-100 pt-2">
        {Object.keys(DialogOptions).map((dialogOption) => {
          let nbOffersForCommMethod = 0;

          offers.forEach(offer => {
            if (stringToContact(offer.user.contactData).method === dialogOption) {
              nbOffersForCommMethod++;
            }
          });

          return (<Fragment key={'dialogOption-' + dialogOption}>
              <p className={classnames("pt-2 pb-2 mb-0 w-100 clickable", {'font-weight-bold': dialogOption === contactMethodFilter})}
                 onClick={(_e) => {
                   setContactMethodFilter(dialogOption);
                   onClose();
                 }}>
                <RoundedIcon bgColor="blue" image={DialogOptionsIcons[dialogOption]} size="md"  className="d-inline-block mr-3"/>
                {dialogOption}
                <span className="text-muted float-right mt-1">
                ({nbOffersForCommMethod})
              </span>
              </p>
              <Separator/>
            </Fragment>
          );
        })}
      </ButtonGroup>
    </ModalBody>
  </Modal>
);

ContactMethodModal.propTypes = {
  onClose: PropTypes.func,
  contactMethodFilter: PropTypes.string,
  setContactMethodFilter: PropTypes.func,
  offers: PropTypes.array
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
    return (<Modal isOpen={true} toggle={onClose} backdrop={true} className="filter-modal">
      <ModalBody>
        <FormGroup className="text-center pt-4">
          <input className="form-control mb-3" type="text" placeholder="Enter a city, state, etc."
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

          <ClearAndApplyButtons close={onClose} onClear={() =>  setLocation('')} onApply={() => setLocation(this.state.location)}/>
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
    return (<Fragment>
      <Typeahead
        id="tokenFilter"
        className="filter-modal"
        options={this.props.tokens.map((token) => ({value: token.address, label: token.symbol}))}
        placeholder={'Search cryptocurrencies'}
        value={this.props.tokenFilter}
        onChange={this.props.setTokenFilter}
        renderMenuItemChildren={(option, props, idx) => {
          const symbol = getOptionLabel(option, props.labelKey);
          let nbOffersForToken = 0;
          this.props.offers.forEach(offer => {
            if (offer.token.symbol === symbol) {
              nbOffersForToken++;
            }
          });
          return (
            <div className="mt-2">
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
              {idx !== this.props.tokens.length - 1 && <Separator/>}
            </div>
          );
        }}
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
              <FlagIcon className="mr-2"/>{this.props.location ? this.props.location : 'Location'}
            </Button>
            <Button className={classnames("p-2 px-3 mr-3", {inactive: this.props.paymentMethodFilter === -1})} onClick={this.openPaymentMethod}>
              <MoneyIcon className="mr-2"/>{this.props.paymentMethodFilter !== -1 ? PAYMENT_METHODS[this.props.paymentMethodFilter] : 'Payment method'}
            </Button>
            <Button className={classnames("p-2 px-3 mr-3", {inactive: !this.props.selectedCurrency})} onClick={this.openCurrencyModal}>
              <CurrencyIcon className="mr-2"/>{this.props.selectedCurrency ? this.props.selectedCurrency : 'Currency'}
            </Button>
            {this.props.selectedCurrency && <Button className={classnames("p-2 px-3 mr-3", {inactive: this.props.amountFilter === -1})} onClick={this.openAmountModal}>
              <TransferIcon className="mr-2"/>{this.props.amountFilter !== -1 ? `${this.props.amountFilter} ${this.props.selectedCurrency}` : 'Amount'}
            </Button>}
            <Button className={classnames("p-2 px-3 mr-3", {inactive: !this.props.contactMethodFilter})} onClick={this.contactMethodModal}>
              <ChatIcon className="mr-2"/>{this.props.contactMethodFilter ? this.props.contactMethodFilter : 'Contact method'}
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
                     currencies={this.props.currencies} selected={this.props.selectedCurrency} t={this.props.t}/>}

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

export default withNamespaces()(SorterFilter);
