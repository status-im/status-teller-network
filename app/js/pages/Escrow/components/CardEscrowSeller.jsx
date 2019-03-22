import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, Button } from 'reactstrap';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNotch, faCheck} from "@fortawesome/free-solid-svg-icons";

import Reputation from '../../../components/Reputation';
import RoundedIcon from "../../../ui/RoundedIcon";

import one from "../../../../images/escrow/01.png";
import two from "../../../../images/escrow/02.png";
import three from "../../../../images/escrow/03.png";
import four from "../../../../images/escrow/04.png";
import five from "../../../../images/escrow/05.png";

const Done = () => (
  <React.Fragment>
    <RoundedIcon icon={faCheck} bgColor="green"/>
    <h2 className="mt-4">Done.</h2>
    <h2 className="mt-4">Rate your trading experience with this user.</h2>
    <Reputation reputation={{upCount: 1, downCount: 1}} size="l"/>
  </React.Fragment>
);

const Releasing = () => (
  <React.Fragment>
    <span className="bg-dark text-white p-3 rounded-circle">
      <img src={five} alt="five" />
    </span>
    <h2 className="mt-4">Waiting for the confirmations from the miners</h2>
    <FontAwesomeIcon icon={faCircleNotch} size="5x" spin/>
  </React.Fragment>
);

const Funded = () => (
  <React.Fragment>
    <span className="bg-dark text-white p-3 rounded-circle">
      <img src={four} alt="four" />
    </span>
    <h2 className="mt-4">Funds are in the escrow. Release them when you will get the payment.</h2>
    <Button color="primary" className="btn-lg mt-3" onClick={() => {}}>Release funds</Button>
  </React.Fragment>
);

const Funding = () => (
  <React.Fragment>
    <span className="bg-dark text-white p-3 rounded-circle">
      <img src={three} alt="three" />
    </span>
    <h2 className="mt-4">Waiting for the confirmations from the miners</h2>
    <FontAwesomeIcon icon={faCircleNotch} size="5x" spin/>
  </React.Fragment>
);

const PreFund = () => (
  <React.Fragment>
    <span className="bg-dark text-white p-3 rounded-circle">
      <img src={two} alt="two" />
    </span>
    <p className="h2 mt-4">You are about to send</p>
    <p className="h2 text-success">2.0 ETH</p>
    <p className="h2">+ our fee</p>
    <p className="h2 text-success">1 SNT</p>
    <Button color="primary" className="btn-lg mt-3" onClick={() => {}}>Fund</Button>
  </React.Fragment>
);

const Start = () => (
  <React.Fragment>
    <span className="bg-dark text-white p-3 rounded-circle">
      <img src={one} alt="one" />
    </span>
    <h2 className="mt-4">Waiting for you to fund the escrow</h2>
    <p>Before accepting the payment you must put the assets into an escrow</p>
    <Button color="primary" className="btn-lg mt-3" onClick={() => {}}>Start</Button>
  </React.Fragment>
);

const CardEscrowSeller = () => (
  <Card>
    <CardBody className="text-center p-5">
      <PreFund/>
    </CardBody>
  </Card>
);

CardEscrowSeller.propTypes = {
};

export default CardEscrowSeller;
