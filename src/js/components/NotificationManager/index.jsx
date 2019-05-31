import React, {Component} from 'react';
import EscrowNotifications from './notifications/EscrowNotifications';

import 'react-notifications/lib/notifications.css';

class NotificationManager extends Component {
  render() {
    return (
      <EscrowNotifications/>
    );
  }
}

NotificationManager.propTypes = {};

export default NotificationManager;
