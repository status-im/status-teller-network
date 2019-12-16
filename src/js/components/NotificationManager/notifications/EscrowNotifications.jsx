import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import escrow from '../../../features/escrow';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import {createNotification} from '../../../utils/notifUtils';
import {withTranslation} from "react-i18next";

class EscrowNotifications extends Component {
  componentDidUpdate(prevProps) {
    const {t, newEscrow, changedEscrow} = this.props;
    if (!prevProps.newEscrow && this.props.newEscrow) {
      createNotification(NotificationManager, 'info', t('notifications.newTrade'),
        t('notifications.newTradeDesc', {offerId: newEscrow.offerId, tokenSymbol: newEscrow.token.symbol, currency: newEscrow.offer.currency}),
        this.props.clearNewEscrow, () => {
          this.props.history.push(`/escrow/${newEscrow.escrowId}`);
        });
    }

    if (!prevProps.changedEscrow && changedEscrow) {
      createNotification(NotificationManager, 'info', t('notifications.tradeChanged'),
        t('notifications.newTradeDesc', {escrowId: changedEscrow.escrowId, status: escrow.helpers.getStatusFromStatusId(changedEscrow.status)}),
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
  t: PropTypes.func,
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
)(withRouter(withTranslation()(EscrowNotifications)));
