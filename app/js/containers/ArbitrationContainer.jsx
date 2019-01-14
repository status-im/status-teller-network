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
      <ArbitrationList escrows={this.props.escrows} 
                       resolveDispute={this.props.resolveDispute}
                       error={this.props.errorGet} 
                       loading={this.props.escrowsLoading} />
    </Fragment>;
  }
}

ArbitrationContainer.propTypes = {
  resolveDispute: PropTypes.func,
  getDisputedEscrows: PropTypes.func,
  escrows: PropTypes.array,
  errorGet: PropTypes.string,
  escrowsLoading: PropTypes.bool
};

const mapStateToProps = state => ({
  errorGet: arbitration.selectors.errorGet(state),
  escrowsLoading: arbitration.selectors.loading(state),
  escrows: arbitration.selectors.escrows(state)
});

export default connect(
  mapStateToProps,
  {
    getDisputedEscrows: arbitration.actions.getDisputedEscrows,
    resolveDispute: arbitration.actions.resolveDispute
  }
)(ArbitrationContainer);
