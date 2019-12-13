import {ButtonGroup, Modal, ModalBody} from "reactstrap";
import ClearButton from "../ClearButton";
import {DialogOptions, DialogOptionsIcons} from "../../../../constants/contactMethods";
import {stringToContact} from "../../../../utils/strings";
import React, {Fragment} from "react";
import classnames from "classnames";
import RoundedIcon from "../../../../ui/RoundedIcon";
import Separator from "../../../MyProfile/components/Separator";
import PropTypes from "prop-types";

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

export default ContactMethodModal;
