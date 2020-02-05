import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col} from 'reactstrap';
import {Link} from "react-router-dom";
import Reputation from '../../../components/Reputation';
import Identicon from "../../../components/UserInformation/Identicon";
import classnames from 'classnames';
import EscrowProxy from '../../../../embarkArtifacts/contracts/EscrowProxy';
import Escrow from '../../../../embarkArtifacts/contracts/Escrow';
import {ARBITRATION_SOLVED_BUYER, ARBITRATION_SOLVED_SELLER} from "../../../features/arbitration/constants";
import {copyToClipboard } from '../../../utils/strings';

const TradeParticipant = ({profile, escrowId, address, isBuyer, winner, multisigInfo = false}) => {
  const data = escrowId ? Escrow.methods.setArbitrationResult(escrowId, isBuyer ?  ARBITRATION_SOLVED_BUYER :  ARBITRATION_SOLVED_SELLER).encodeABI() : '';
  return <Row className="border bg-white rounded p-2 mr-0 ml-0 mb-2" >
    <Col className="p-0" >
      <Row tag={Link} to={`/profile/` + address}>
        <Col xs={3} md={2} className="text-center">
          <Identicon seed={address} className="rounded-circle border" scale={5}/>
          <span className={classnames("icon-badge", {'seller-text': !isBuyer, 'buyer-text': isBuyer, 'text-success': winner})}>
            {isBuyer ? 'Buyer' : 'Seller'}
          </span>
        </Col>
        <Col xs={4} md={5}>
          <p className={classnames('seller-name', 'm-0', 'font-weight-bold', {'text-success': winner})}>{profile.username}</p>
          <p className="text-dark m-0">{profile.location}</p>
        </Col>
        <Col xs={5} className="text-right rating-col">
          <p className="text-dark m-0 text-right mb-1">{profile.nbReleasedTrades || 0} trades</p>
          <Reputation reputation={{upCount: profile.reputation.upCount, downCount: profile.reputation.upCount}} size="s"/>
        </Col>
      </Row>
      { multisigInfo && <Row className="mb-4">
        <Col>
          To select the {isBuyer ? 'buyer' : 'seller'} as the winner of the dispute, create a custom transaction in the multisig wallet with the following parameters (click to copy):
          <ul className="p-3 text-small overflow-auto">
            <li>Recipient: <span className="font-weight-bold clickable" onClick={() => copyToClipboard(EscrowProxy.options.address)}>{EscrowProxy.options.address}</span></li>
            <li>Value: <span className="font-weight-bold clickable" onClick={() => copyToClipboard('0')}>0</span></li>
            <li>Data (hex encoded): <span className="font-weight-bold clickable" onClick={() => copyToClipboard(data)}>{data}</span></li>
          </ul>
        </Col>
      </Row>}
    </Col>
  </Row>;
};

TradeParticipant.propTypes = {
  escrowId: PropTypes.string,
  profile: PropTypes.object,
  address: PropTypes.string,
  isBuyer: PropTypes.bool,
  winner: PropTypes.bool,
  multisigInfo: PropTypes.bool
};


export default TradeParticipant;
