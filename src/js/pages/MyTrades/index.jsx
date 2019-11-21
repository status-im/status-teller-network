import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {withRouter} from "react-router-dom";

import metadata from '../../features/metadata';
import network from '../../features/network';
import escrow from '../../features/escrow';
import arbitration from '../../features/arbitration';

import Trades from './components/Trades';
import { zeroAddress } from '../../utils/address';

import Loading from "../../components/Loading";
import events from "../../features/events";
import prices from "../../features/prices";

const NULL_PROFILE = {
  address: zeroAddress,
  username: '',
  statusContactCode: '0x0000000000000000000000000000000000000000',
  reputation: {upCount: 0, downCount: 0},
  offers: []
};

class MyTrades extends Component {
  constructor(props) {
    super(props);
    if (props.trades) {
      this.watchEscrows();
    }
  }

  componentDidMount() {
    this.props.loadProfile(this.props.address);
    this.props.getDisputedEscrows();
  }

  componentDidUpdate(oldProps){
    if(this.props.profile && !this.props.profile.statusContactCode){
      return this.props.history.push("/profile/contact/edit");
    }

    if ((!oldProps.trades && this.props.trades) || oldProps.trades.length !== this.props.trades.length) {
      this.watchEscrows();
    }
  }

  watchEscrows() {
    this.props.trades.forEach(trade => {
      if (!this.props.escrowEvents[trade.escrowId] &&
        (trade.status === escrow.helpers.tradeStates.funded ||
          trade.status === escrow.helpers.tradeStates.arbitration_open ||
          trade.status === escrow.helpers.tradeStates.paid ||
          trade.status === escrow.helpers.tradeStates.waiting)) {
        this.props.watchEscrow(trade.escrowId);
        }
      });
  }

  tradeClick = (escrowId) => {
    this.props.history.push('/escrow/' + escrowId);
  };

  render() {
    const {profile} = this.props;

    if(!profile) return <Loading page={true} />;

    const trades = this.props.trades.map(x => {
      const dispute = this.props.disputes.find(y => y.escrowId === x.escrowId);
      if(dispute){
        x.arbitration = dispute.arbitration;
      }
      return x;
    });

    return <Fragment>
        <h3 className="d-inline-block">Active trades</h3>
        <Trades trades={trades} active address={this.props.address} tradeClick={this.tradeClick} prices={this.props.prices}/>
        <h3 className="d-inline-block">Past trades</h3>
        <Trades trades={trades} address={this.props.address} tradeClick={this.tradeClick} prices={this.props.prices}/>
      </Fragment>;
  }
}

MyTrades.propTypes = {
  history: PropTypes.object,
  address: PropTypes.string,
  profile: PropTypes.object,
  trades: PropTypes.array,
  disputes: PropTypes.array,
  loadProfile: PropTypes.func,
  getDisputedEscrows: PropTypes.func,
  escrowEvents: PropTypes.object,
  prices: PropTypes.object,
  watchEscrow: PropTypes.func
};

const mapStateToProps = state => {
  const address = network.selectors.getAddress(state) || '';
  const profile = metadata.selectors.getProfile(state, address) || NULL_PROFILE;
  return {
    address,
    profile,
    trades: escrow.selectors.getTrades(state, address, profile.offers.map(offer => offer.id)),
    disputes: arbitration.selectors.escrows(state),
    escrowEvents: events.selectors.getEscrowEvents(state),
    prices: prices.selectors.getPrices(state)
  };
};

export default connect(
  mapStateToProps,
  {
    loadProfile: metadata.actions.load,
    getDisputedEscrows: arbitration.actions.getDisputedEscrows,
    watchEscrow: escrow.actions.watchEscrow
})(withRouter(MyTrades));
