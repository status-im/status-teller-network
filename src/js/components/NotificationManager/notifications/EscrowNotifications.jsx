import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import escrow from '../../../features/escrow';
import {NotificationContainer, NotificationManager} from 'react-notifications';

const DELAY = 5000;

class EscrowNotifications extends Component {
  componentDidUpdate(prevProps) {
    if (!prevProps.newEscrow && this.props.newEscrow) {
      NotificationManager.info(`For Offer ${this.props.newEscrow.offerId}: ${this.props.newEscrow.token.symbol} → ${this.props.newEscrow.offer.currency}`,
        'New trade created', DELAY, () => {
          clearTimeout(this.escrowNotifTimeout);
          this.props.clearNewEscrow();
          this.props.history.push(`/escrow/${this.props.newEscrow.escrowId}`);
        });
      this.escrowNotifTimeout = setTimeout(() => {
        this.props.clearNewEscrow();
      }, DELAY);
    }
  }

  render() {
    return <NotificationContainer/>;
  }
}

EscrowNotifications.propTypes = {
  newEscrow: PropTypes.object,
  history: PropTypes.object,
  clearNewEscrow: PropTypes.func
};


const mapStateToProps = (state) => {
  const newEscrowId = escrow.selectors.newEscrow(state);
  return {
    newEscrow: escrow.selectors.getEscrowById(state, newEscrowId)
  };
};

export default connect(
  mapStateToProps,
  {
    clearNewEscrow: escrow.actions.clearNewEscrow
  }
)(withRouter(EscrowNotifications));
