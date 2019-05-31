import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import escrow from '../../../features/escrow';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import {createNotification} from '../notifUtils';

class EscrowNotifications extends Component {
  componentDidUpdate(prevProps) {
    const {newEscrow, changedEscrow} = this.props;
    if (!prevProps.newEscrow && this.props.newEscrow) {
      createNotification(NotificationManager, 'info', 'New trade created',
        `For Offer #${newEscrow.offerId}: ${newEscrow.token.symbol} → ${newEscrow.offer.currency}`,
        this.props.clearNewEscrow, () => {
          this.props.history.push(`/escrow/${newEscrow.escrowId}`);
        });
    }

    if (!prevProps.changedEscrow && changedEscrow) {
      createNotification(NotificationManager, 'info', 'Trade status changed',
        `Trade # ${changedEscrow.escrowId} is now ${escrow.helpers.getStatusFromStatusId(changedEscrow.status)}`,
        this.props.clearChangedEscrow, () => {
          this.props.history.push(`/escrow/${changedEscrow.escrowId}`);
        });
    }
  }

  render() {
    return <NotificationContainer/>;
  }
}

EscrowNotifications.propTypes = {
  newEscrow: PropTypes.object,
  history: PropTypes.object,
  changedEscrow: PropTypes.object,
  clearNewEscrow: PropTypes.func,
  clearChangedEscrow: PropTypes.func
};


const mapStateToProps = (state) => {
  const newEscrowId = escrow.selectors.newEscrow(state);
  return {
    newEscrow: escrow.selectors.getEscrowById(state, newEscrowId),
    changedEscrow: escrow.selectors.changedEscrow(state)
  };
};

export default connect(
  mapStateToProps,
  {
    clearNewEscrow: escrow.actions.clearNewEscrow,
    clearChangedEscrow: escrow.actions.clearChangedEscrow
  }
)(withRouter(EscrowNotifications));
