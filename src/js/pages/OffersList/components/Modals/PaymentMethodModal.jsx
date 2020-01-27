import {ButtonGroup, Modal, ModalBody} from "reactstrap";
import ClearButton from "../ClearButton";
import {PAYMENT_METHODS, POPULAR_PAYMENT_METHODS_INDEXES} from "../../../../features/metadata/constants";
import React, {Component, Fragment} from "react";
import CheckButton from "../../../../ui/CheckButton";
import Separator from "../../../MyProfile/components/Separator";
import PropTypes from "prop-types";
import {withTranslation} from "react-i18next";

class PaymentMethodModal extends Component {
  constructor(props) {
    super(props);
    this.paymentMethodsWithoutPopIdxs = [];

    this.filterMethodsWithoutOffers();
  }

  filterMethodsWithoutOffers() {
    this.paymentMethodsWithoutPopIdxs = Object.keys(PAYMENT_METHODS).filter(methodId =>
      POPULAR_PAYMENT_METHODS_INDEXES.indexOf(parseInt(methodId, 10)) === -1 &&
      this.props.offers.find(offer => offer.paymentMethods.includes(parseInt(methodId, 10))));
  }

  componentDidUpdate(prevProps) {
    if (prevProps.offers.length !== this.props.offers.length) {
      this.filterMethodsWithoutOffers();
    }
  }

  render() {
    const {t, onClose, paymentMethodFilter, setPaymentMethodFilter} = this.props;
    return (
      <Modal isOpen={true} toggle={onClose} backdrop={true} className="filter-modal">
        <ClearButton close={onClose} onClear={() => setPaymentMethodFilter(-1)}/>
        <ModalBody className="mt-4">
          <p className="text-muted text-small mb-0">{t('filter.popular')}</p>
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

          {this.paymentMethodsWithoutPopIdxs.length > 0 && <Fragment>
            <p className="text-muted text-small mt-3 mb-0">{t('filter.allMethods')}</p>
            <ButtonGroup vertical className="w-100 pb-3">
              {this.paymentMethodsWithoutPopIdxs.map((index) => (
                <Fragment key={'paymentMethod-' + index}>
                  <CheckButton active={index === paymentMethodFilter}
                               className="mt-2"
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
          </Fragment>}
        </ModalBody>
      </Modal>
    );
  }
}

PaymentMethodModal.propTypes = {
  t: PropTypes.func,
  onClose: PropTypes.func,
  paymentMethodFilter: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  setPaymentMethodFilter: PropTypes.func,
  offers: PropTypes.array
};

export default withTranslation()(PaymentMethodModal);
