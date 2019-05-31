import React, {Component} from 'react';
import EscrowNotifications from './notifications/EscrowNotifications';

import 'react-notifications/lib/notifications.css';
import './index.scss';

class NotificationManager extends Component {
  render() {
    return (
      <EscrowNotifications/>
    );
  }
}

NotificationManager.propTypes = {};

export default NotificationManager;
