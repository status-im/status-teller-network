import {ButtonGroup, Modal, ModalBody} from "reactstrap";
import ClearButton from "../ClearButton";
import {PAYMENT_METHODS, POPULAR_PAYMENT_METHODS_INDEXES} from "../../../../features/metadata/constants";
import React, {Fragment} from "react";
import CheckButton from "../../../../ui/CheckButton";
import Separator from "../../../MyProfile/components/Separator";
import PropTypes from "prop-types";
import {withTranslation} from "react-i18next";

const PaymentMethodModal = ({t, onClose, paymentMethodFilter, setPaymentMethodFilter}) => (
  <Modal isOpen={true} toggle={onClose} backdrop={true} className="filter-modal">
    <ClearButton close={onClose} onClear={() =>  setPaymentMethodFilter(-1)}/>
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

      <p className="text-muted text-small mt-3 mb-0">{t('filter.allMethods')}</p>
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
  t: PropTypes.func,
  onClose: PropTypes.func,
  paymentMethodFilter:  PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  setPaymentMethodFilter: PropTypes.func
};

export default withTranslation()(PaymentMethodModal);
