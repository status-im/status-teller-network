/* global web3 */
import React from 'react';
import PropTypes from 'prop-types';

import {Col, Modal, ModalBody, ModalHeader, Row, Button} from "reactstrap";
import RoundedIcon from "../../../../ui/RoundedIcon";
import pencilIcon from "../../../../../images/pencil.svg";
import {getTokenImage} from "../../../../utils/images";

import './FinalModal.scss';

const FinalModal = ({isOpen, hide, postOffer, stake}) => (
  <Modal isOpen={isOpen} toggle={hide} className="final-step-modal">
    <ModalHeader>
      <RoundedIcon image={pencilIcon} className="mb-3" bgColor="blue"/>
      <p className="m-0">Final Step</p>
    </ModalHeader>
    <ModalBody className="text-center">
      <p className="text-muted">Almost there! As a way to protect teller from spams, each offer is under a stake condition. The stake is as small as 0.10 USD in ETH.</p>

      <p className="text-muted">The stake will be returned to you as soon as you 1) Delete this offer, or 2) successfully finish a trade.</p>
      <div className="bottom-details ">
        <Row>
          <Col xs={3}>Asset</Col>
          <Col xs={9} className="text-right">
            Ethereum <span className="text-muted">ETH</span>
            <img src={getTokenImage('ETH')}
                 alt={'ETH icon'}
                 className="ml-2"/>
          </Col>
        </Row>
        <Row>
          <Col xs={3}>Stake</Col>
          <Col xs={9} className="text-right">
            {web3.utils.fromWei(stake || '0', "ether")} <span className="text-muted">ETH</span> ~ 0.10 <span className="text-muted">USD</span>
          </Col>
        </Row>
      </div>

      <Button color="primary" className="mt-4" onClick={postOffer}>Sign & Post the offer</Button>
    </ModalBody>
  </Modal>
);

FinalModal.propTypes = {
  isOpen: PropTypes.bool,
  stake: PropTypes.string,
  hide: PropTypes.func,
  postOffer: PropTypes.func
};

export default FinalModal;
