import {ButtonGroup, Modal, ModalBody} from "reactstrap";
import ClearButton from "../ClearButton";
import {DialogOptions, DialogOptionsIcons} from "../../../../constants/contactMethods";
import {stringToContact} from "../../../../utils/strings";
import React, {Component, Fragment} from "react";
import classnames from "classnames";
import RoundedIcon from "../../../../ui/RoundedIcon";
import Separator from "../../../MyProfile/components/Separator";
import PropTypes from "prop-types";
import {sortByNbOffers} from "../../../../utils/sorters";

class ContactMethodModal extends Component {
  constructor(props) {
    super(props);
    this.methods = {};

    this.calculateNbOffers();
  }

  calculateNbOffers() {
    Object.keys(DialogOptions).forEach(dialogOption => {
      this.methods[dialogOption] = {nbOffers: 0, option: dialogOption};
      this.props.offers.forEach(offer => {
        if (stringToContact(offer.user.contactData).method === dialogOption) {
          this.methods[dialogOption].nbOffers++;
        }
      });
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.offers.length !== this.props.offers.length) {
      this.calculateNbOffers();
    }
  }

  render() {
    const {onClose, contactMethodFilter, setContactMethodFilter} = this.props;
    return (<Modal isOpen={true} toggle={onClose} backdrop={true} className="filter-modal">
      <ClearButton onClear={() => setContactMethodFilter('')} close={onClose}/>
      <ModalBody className="pb-4 mt-4 ">
        <ButtonGroup vertical className="w-100 pt-2">
          {Object.values(this.methods).sort(sortByNbOffers).map((dialogObj) => {
            const dialogOption = dialogObj.option;
            return (<Fragment key={'dialogOption-' + dialogOption}>
                <p
                  className={classnames("pt-2 pb-2 mb-0 w-100 clickable", {'font-weight-bold': dialogOption === contactMethodFilter})}
                  onClick={(_e) => {
                    setContactMethodFilter(dialogOption);
                    onClose();
                  }}>
                  <RoundedIcon bgColor="blue" image={DialogOptionsIcons[dialogOption]} size="md"
                               className="d-inline-block mr-3"/>
                  {dialogOption}
                  <span className="text-muted float-right mt-1">
                ({this.methods[dialogOption].nbOffers})
              </span>
                </p>
                <Separator/>
              </Fragment>
            );
          })}
        </ButtonGroup>
      </ModalBody>
    </Modal>);
  }
}

ContactMethodModal.propTypes = {
  onClose: PropTypes.func,
  contactMethodFilter: PropTypes.string,
  setContactMethodFilter: PropTypes.func,
  offers: PropTypes.array
};

export default ContactMethodModal;
