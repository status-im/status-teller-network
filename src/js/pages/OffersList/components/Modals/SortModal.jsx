import {ButtonGroup, Modal, ModalBody} from "reactstrap";
import React, {Fragment} from "react";
import CheckButton from "../../../../ui/CheckButton";
import Separator from "../../../MyProfile/components/Separator";
import PropTypes from "prop-types";

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

export default SorterModal;
