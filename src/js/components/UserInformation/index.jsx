import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col} from 'reactstrap';
import Reputation from "../Reputation";
import Address from './Address';
import Identicon from "./Identicon";
import {withTranslation} from "react-i18next";

const UserInformation = ({t, identiconSeed, isFallbackArbitrator, username, reputation, isArbitrator, nbReleasedTrades, nbCreatedTrades}) => (
  <Row className="m-0 text-center mb-4">
    <Col xs="12">
      <Identicon seed={identiconSeed} className="rounded-circle border" scale={8} />
      {isArbitrator && !isFallbackArbitrator && <span className="icon-badge">{t('general.arbitrator')}</span>}
      {isFallbackArbitrator && <span className="icon-badge">{t('profile.fallbackArbitrator')}</span>}

    </Col>
    <Col xs="12">
      <h4 className="font-weight-bold">{username}</h4>
    </Col>
    <Col xs="12" className="text-muted">
      <Address address={identiconSeed} length={10} />
    </Col>
    <Col xs="12">
      <Reputation reputation={reputation}/>
    </Col>
    {(nbReleasedTrades || nbReleasedTrades === 0) && <Col xs="12" className="text-muted text-small mt-3">{nbReleasedTrades} completed trade{nbReleasedTrades > 1 && 's'}</Col>}
    {(nbCreatedTrades || nbCreatedTrades === 0) && <Col xs="12" className="text-muted text-small">{nbCreatedTrades} created trade{nbCreatedTrades > 1 && 's'}</Col>}
  </Row>);

UserInformation.propTypes = {
  t: PropTypes.func,
  identiconSeed: PropTypes.string,
  username: PropTypes.string,
  reputation: PropTypes.object,
  isArbitrator: PropTypes.bool,
  nbReleasedTrades: PropTypes.number,
  nbCreatedTrades: PropTypes.number,
  isFallbackArbitrator: PropTypes.bool
};

export default withTranslation()(UserInformation);
