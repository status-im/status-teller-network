import React, {Component} from 'react';
import EscrowNotifications from './notifications/EscrowNotifications';

class NotificationManager extends Component {
  render() {
    return (
      <EscrowNotifications/>
    );
  }
}

NotificationManager.propTypes = {};

export default NotificationManager;
