import React, {Component} from "react";
import {Modal, ModalBody} from "reactstrap";
import ClearButton from "../ClearButton";
import {Highlighter, Typeahead} from "react-bootstrap-typeahead";
import {getOptionLabel} from "react-bootstrap-typeahead/lib/utils";
import RoundedIcon from "../../../../ui/RoundedIcon";
import Separator from "../../../MyProfile/components/Separator";
import PropTypes from "prop-types";
import {withTranslation} from "react-i18next";
import {sortByNbOffers} from "../../../../utils/sorters";

class CurrencyModal extends Component {
  constructor(props) {
    super(props);
    this.currentValue = null;
    this.lastKeyIsArrow = false;
  }

  render() {
    const {t, onClose, selected, currencies, changeCurrency, offers} = this.props;
    const defaultSelectedValue = [];
    if (selected) {
      const currency = currencies.find(x => x.id === selected);
      defaultSelectedValue.push(currency);
    }

    const theCurrencies = {};
    currencies.forEach(currency => {
      currency.nbOffers = 0;
      offers.forEach(offer => {
        if (offer.currency === currency.id) {
          currency.nbOffers++;
        }
      });
      theCurrencies[currency.id] = currency;
    });

    return (
      <Modal isOpen={true} toggle={onClose} backdrop={true} className="filter-modal">
        <ClearButton t={t} onClear={() => changeCurrency('')} close={onClose}/>
        <ModalBody>
          <Typeahead className="mb-3 mt-5"
                     id="fiatSelector"
                     onChange={(items) => {
                       if (items.length) {
                         const item = items[0];
                         changeCurrency(item.id);
                         onClose();
                       }
                     }}
                     onKeyDown={e => {
                       if (e.key === 'Enter' && this.currentValue === '' && !this.lastKeyIsArrow) {
                         changeCurrency('');
                         return onClose();
                       }
                       this.lastKeyIsArrow = e.key === 'ArrowDown' || e.key === 'ArrowUp';
                     }}
                     options={Object.values(theCurrencies).sort(sortByNbOffers)}
                     labelKey="id"
                     placeholder={t("fiatSelectorForm.placeholder")}
                     onInputChange={(text) => {
                       this.currentValue = text;
                     }}
                     submitFormOnEnter={true}
                     emptyLabel={t("fiatSelectorForm.emptyLabel")}
                     defaultSelected={defaultSelectedValue}
                     renderMenuItemChildren={(option, _props, idx) => {
                       const currency = getOptionLabel(option, _props.labelKey);
                       return (<div className="mt-2">
                         <RoundedIcon bgColor="blue" text={option.symbol} className="d-inline-block mr-3" size="md"/>
                         <Highlighter search={_props.text}>
                           {currency}
                         </Highlighter>
                         <span className="text-muted ml-2 d-inline-block mb-2">
                        {option.label}
                     </span>
                         <span className="text-muted float-right mt-1">
                       ({theCurrencies[currency].nbOffers})
                     </span>
                         {idx !== currencies.length - 1 && <Separator/>}
                       </div>);
                     }}
          />
        </ModalBody>
      </Modal>
    );
  }
}

CurrencyModal.propTypes = {
  t: PropTypes.func,
  onClose: PropTypes.func,
  changeCurrency: PropTypes.func,
  currencies: PropTypes.array,
  selected: PropTypes.string,
  offers: PropTypes.array
};

export default withTranslation()(CurrencyModal);
