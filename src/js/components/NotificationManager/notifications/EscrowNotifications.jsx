import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import escrow from '../../../features/escrow';

const DELAY = 5000;

class EscrowNotifications extends Component {
  componentDidUpdate(prevProps) {
    if (!prevProps.newEscrow && this.props.newEscrow) {
      this.escrowNotifTimeout = setTimeout(() => {
        console.log('Remove this');
      }, DELAY);
    }
  }

  render() {
    if (this.props.newEscrow) {
      console.log('NEW ESCrow', this.props.newEscrow);
    }
    return null;
  }
}

EscrowNotifications.propTypes = {
  newEscrow: PropTypes.object
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
  }
)(withRouter(EscrowNotifications));
