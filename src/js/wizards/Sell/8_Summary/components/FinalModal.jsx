/* global web3 */
import React from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from "react-i18next";
import {Col, Modal, ModalBody, ModalHeader, Row, Button} from "reactstrap";
import RoundedIcon from "../../../../ui/RoundedIcon";
import pencilIcon from "../../../../../images/pencil.svg";
import {getTokenImage} from "../../../../utils/images";

import './FinalModal.scss';

const FinalModal = ({isOpen, hide, postOffer, stake, prices, t}) => {
  const ETHAmount = web3.utils.fromWei(stake || '0', "ether");
  const ETHPrice = parseFloat(prices.ETH.USD) * parseFloat(ETHAmount);

  return (
  <Modal isOpen={isOpen} toggle={hide} className="final-step-modal">
    <ModalHeader>
      <RoundedIcon image={pencilIcon} className="mb-3" bgColor="blue"/>
      <p className="m-0">{t('sellSummary.modal.title')}</p>
    </ModalHeader>
    <ModalBody className="text-center">
      <p className="text-muted">{t('sellSummary.modal.p1')}</p>

      <p className="text-muted">{t('sellSummary.modal.p2')}</p>
      <div className="bottom-details ">
        <Row>
          <Col xs={3}>{t('sellSummary.asset')}</Col>
          <Col xs={9} className="text-right">
            Ethereum <span className="text-muted">ETH</span>
            <img src={getTokenImage('ETH')}
                 alt={'ETH icon'}
                 className="ml-2"/>
          </Col>
        </Row>
        <Row>
          <Col xs={3}>{t('sellSummary.modal.stake')}</Col>
          <Col xs={9} className="text-right">
            {ETHAmount} <span className="text-muted">ETH</span> ~ {ETHPrice.toFixed(2)} <span className="text-muted">USD</span>
          </Col>
        </Row>
      </div>

      <Button color="primary" className="mt-4" onClick={postOffer}>{t('sellSummary.modal.button')}</Button>
    </ModalBody>
  </Modal>
  );
};

FinalModal.propTypes = {
  t: PropTypes.func,
  isOpen: PropTypes.bool,
  stake: PropTypes.string,
  hide: PropTypes.func,
  postOffer: PropTypes.func,
  prices: PropTypes.object
};

export default withTranslation()(FinalModal);
