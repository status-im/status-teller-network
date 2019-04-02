/* eslint-disable no-alert */

import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, Button } from 'reactstrap';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNotch, faCheck} from "@fortawesome/free-solid-svg-icons";
import { fromTokenDecimals } from '../../../utils/numbers';

import Reputation from '../../../components/Reputation';
import RoundedIcon from "../../../ui/RoundedIcon";

import escrow from '../../../features/escrow';
import { States } from '../../../utils/transaction';

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

const Funded = ({trade, releaseEscrow}) => (
  <React.Fragment>
    <span className="bg-dark text-white p-3 rounded-circle">
      <img src={four} alt="four" />
    </span>
    <h2 className="mt-4">Funds are in the escrow. Release them when you will get the payment.</h2>
    <Button color="primary" className="btn-lg mt-3" onClick={() => { if(confirm('Sure?')) releaseEscrow(trade.escrowId); }}>Release funds</Button>
  </React.Fragment>
);

Funded.propTypes = {
  releaseEscrow: PropTypes.func,
  trade: PropTypes.object
};

const Funding = () => (
  <React.Fragment>
    <span className="bg-dark text-white p-3 rounded-circle">
      <img src={three} alt="three" />
    </span>
    <h2 className="mt-4">Waiting for the confirmations from the miners</h2>
    <FontAwesomeIcon icon={faCircleNotch} size="5x" spin/>
  </React.Fragment>
);

const PreFund = ({fee, showApproveScreen, showFundButton, fundEscrow, trade}) => (
  <Fragment>
    <span className="bg-dark text-white p-3 rounded-circle">
      <img src={two} alt="two" />
    </span>
    <p className="h2 mt-4">{!showFundButton ? 'You are about to approve' : 'You are about to send'}</p>
    <p className="h2 text-success">{fromTokenDecimals(trade.tradeAmount, trade.token.decimals)} {trade.token.symbol}</p>
    { fee !== "0" && <Fragment>
    <p className="h2">+ our fee</p>
    <p className="h2 text-success">{fromTokenDecimals(fee, 18)} SNT</p>
    </Fragment> }
    <Button color="primary" className="btn-lg mt-3" onClick={showFundButton ? () => { fundEscrow(trade, fee); } : showApproveScreen}>{showFundButton ? 'Fund' : 'Approve Token Transfer(s)' }</Button>
  </Fragment>
);

PreFund.propTypes = {
  trade: PropTypes.object,
  fee: PropTypes.string,
  showApproveScreen: PropTypes.func,
  showFundButton: PropTypes.bool,
  fundEscrow: PropTypes.func
};

const Start = ({onClick}) => (
  <React.Fragment>
    <span className="bg-dark text-white p-3 rounded-circle">
      <img src={one} alt="one" />
    </span>
    <h2 className="mt-4">Waiting for you to fund the escrow</h2>
    <p>Before accepting the payment you must put the assets into an escrow</p>
    <Button color="primary" className="btn-lg mt-3" onClick={onClick}>Start</Button>
  </React.Fragment>
);

Start.propTypes = {
  onClick: PropTypes.func
};

class CardEscrowSeller extends Component {

  state = {
    step: 1
  }

  componentDidMount(){
    this.determineStep(this.props.trade);
  }

  determineStep(trade){
    let step;

    switch(trade.status){
      case escrow.helpers.tradeStates.released:
        step = 5;
        break;
      case escrow.helpers.tradeStates.funded:
        step = 4;
        break;
      case escrow.helpers.tradeStates.paid: {
        step = 4;
        break;
      }
      case escrow.helpers.tradeStates.waiting:
      default:
        step = 1;
    }

    this.setState({step});
  }

  componentDidUpdate(prevProps) {
    if (this.props.trade.escrowId !== prevProps.trade.escrowId) {
      this.determineStep(this.props.trade);
    }
  }

  handleStepClick = () => {
    let step = this.state.step;
    step++;
    this.setState({step});
  }

  render(){
    let step = this.state.step;

    const {trade, fee, showApproveScreen, fundEscrow, releaseEscrow, fundStatus, releaseStatus} = this.props;
    let showFundButton = this.props.showFundButton;

    if(trade.status === escrow.helpers.tradeStates.released || trade.status === escrow.helpers.tradeStates.paid){
      showFundButton = false;
    }

    if(showFundButton) step = 2;
    if(fundStatus === States.pending || releaseStatus === States.pending) step = 3;
    if(fundStatus === States.success) step = 4;
    if(releaseStatus === States.success || trade.status === escrow.helpers.tradeStates.released) step = 5;

    let component;
    switch(step){
      case 5: 
        component = <Done />;
        break;
      case 4: 
        component = <Funded trade={trade} releaseEscrow={releaseEscrow} />;
        break;
      case 3:
        component = <Funding />;
        break;
      case 2:
        component = <PreFund showFundButton={showFundButton} fundEscrow={fundEscrow} trade={trade} fee={fee} showApproveScreen={showApproveScreen} />;
        break;
      case 1:
      default: 
        component = <Start onClick={this.handleStepClick} />;
    }
    

    return <Card>
    <CardBody className="text-center p-5">
      {component}
    </CardBody>
  </Card>;
  }
}

CardEscrowSeller.propTypes = {
  trade: PropTypes.object,
  fee: PropTypes.string,
  showApproveScreen: PropTypes.func,
  fundEscrow: PropTypes.func,
  showFundButton: PropTypes.bool,
  releaseEscrow: PropTypes.func,
  fundStatus: PropTypes.string,
  releaseStatus: PropTypes.string
};

export default CardEscrowSeller;
