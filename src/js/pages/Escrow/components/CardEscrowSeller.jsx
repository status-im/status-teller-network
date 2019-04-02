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

const Funded = ({releaseAction}) => (
  <React.Fragment>
    <span className="bg-dark text-white p-3 rounded-circle">
      <img src={four} alt="four" />
    </span>
    <h2 className="mt-4">Funds are in the escrow. Release them when you will get the payment.</h2>
    <Button color="primary" className="btn-lg mt-3" onClick={() => { if(confirm('Sure?')) releaseAction(); }}>Release funds</Button>
  </React.Fragment>
);

Funded.propTypes = {
  releaseAction: PropTypes.func
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

const PreFund = ({amount, asset, fee, showApproveScreen, showFundButton, fundAction}) => (
  <React.Fragment>
    <span className="bg-dark text-white p-3 rounded-circle">
      <img src={two} alt="two" />
    </span>
    <p className="h2 mt-4">{!showFundButton ? 'You are about to approve' : 'You are about to send'}</p>
    <p className="h2 text-success">{fromTokenDecimals(amount, asset.decimals)} {asset.symbol}</p>
    { fee !== "0" && <Fragment>
    <p className="h2">+ our fee</p>
    <p className="h2 text-success">{fromTokenDecimals(fee, 18)} SNT</p>
    </Fragment> }
    <Button color="primary" className="btn-lg mt-3" onClick={showFundButton ? fundAction : showApproveScreen}>{showFundButton ? 'Fund' : 'Approve Token Transfer(s)' }</Button>
  </React.Fragment>
);

PreFund.propTypes = {
  amount: PropTypes.string,
  asset: PropTypes.object,
  fee: PropTypes.string,
  showApproveScreen: PropTypes.func,
  showFundButton: PropTypes.bool,
  fundAction: PropTypes.func
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
    this.determineStep(this.props.escrow);
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
    if (this.props.escrow.escrowId !== prevProps.escrow.escrowId) {
      this.determineStep(this.props.escrow);
    }
  }

  handleStepClick = () => {
    let step = this.state.step;
    step++;
    this.setState({step});
  }

  render(){
    let step = this.state.step;
    const {escrow, fee, showApproveScreen, showFundButton, fundAction, showLoading, showFunded, releaseEscrow, showRating} = this.props;

    if(showFundButton) step = 2;
    if(showLoading) step = 3;
    if(showFunded) step = 4;
    if(showRating) step = 5;

    let component;
    switch(step){
      case 5: 
        component = <Done />;
        break;
      case 4: 
        component = <Funded releaseAction={releaseEscrow} />;
        break;
      case 3:
        component = <Funding />;
        break;
      case 2:
        component = <PreFund showFundButton={showFundButton} fundAction={fundAction} amount={escrow.tradeAmount} asset={escrow.token} fee={fee} showApproveScreen={showApproveScreen} />;
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
  showLoading: PropTypes.bool,
  escrow: PropTypes.object,
  fee: PropTypes.string,
  showApproveScreen: PropTypes.func,
  fundAction: PropTypes.func,
  showFundButton: PropTypes.bool,
  showFunded: PropTypes.bool,
  releaseEscrow: PropTypes.func,
  showRating: PropTypes.bool
};

export default CardEscrowSeller;
