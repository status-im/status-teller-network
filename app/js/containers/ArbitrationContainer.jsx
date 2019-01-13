import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import arbitration from '../features/arbitration';
import PropTypes from 'prop-types';
import ArbitrationList from "../components/ArbitrationList";

class ArbitrationContainer extends Component {
  componentDidMount() {
    this.props.getDisputedEscrows();
  }

  render() {
    return <Fragment>
      <ArbitrationList escrows={this.props.escrows} payEscrow={this.props.payEscrow}
                  error={this.props.errorGet} loading={this.props.escrowsLoading} />
    </Fragment>;
  }
}

ArbitrationContainer.propTypes = {
  payEscrow: PropTypes.func,
  getDisputedEscrows: PropTypes.func,
  escrows: PropTypes.array,
  errorGet: PropTypes.string,
  error: PropTypes.string
};

const mapStateToProps = state => ({
  escrowError: arbitration.selectors.error(state),
  escrowReceipt: arbitration.selectors.receipt(state),
  errorGet: arbitration.selectors.errorGet(state),
  escrowsLoading: arbitration.selectors.loading(state),
  escrows: arbitration.selectors.escrows(state)
});

export default connect(
  mapStateToProps,
  {
    getDisputedEscrows: arbitration.actions.getDisputedEscrows,
    payEscrow: arbitration.actions.payEscrow
  }
)(ArbitrationContainer);
