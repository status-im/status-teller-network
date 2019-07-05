import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import {withRouter} from "react-router-dom";
import network from '../../features/network';
import arbitration from '../../features/arbitration';
import Loading from '../../components/Loading';
import ErrorInformation from '../../components/ErrorInformation';
import PropTypes from 'prop-types';
import BootstrapSwitchButton from 'bootstrap-switch-button-react';


class SellerApproval extends Component {
  constructor(props) {
    super(props);
  }

  cancelRequest = (arbitrator) => () => {
    this.props.cancelArbitratorRequest(arbitrator);
  }

  onToggle = () => {

  }

  render(){
    const {loading, error, txHash, cancelArbitratorsActions} = this.props;
    if(error) {
      return <ErrorInformation transaction message={error} cancel={cancelArbitratorsActions}/>;
    }

    if(loading) return <Loading mining={true} txHash={txHash} />;

    return (
    <Fragment>
        <h2 className="mb-4">Seller Management</h2>
        <h3 className="mb-2">Accept all sellers</h3>
        <BootstrapSwitchButton onlabel="ON" offlabel="OFF" checked={false}/>


        <p><br /><br /><br />TODO: show list of requests for arbitrator</p>
        
    </Fragment>
    );
  }
}

SellerApproval.propTypes = {
  arbitrators: PropTypes.object,
  users: PropTypes.object,
  address: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.string,
  txHash: PropTypes.string,
  getArbitrators: PropTypes.func,
  getUser: PropTypes.func,
  requestArbitrator: PropTypes.func,
  cancelArbitratorsActions: PropTypes.func,
  cancelArbitratorRequest: PropTypes.func
};


const mapStateToProps = state => {
  const address = network.selectors.getAddress(state) || '';
  return {
    address,
    loading: arbitration.selectors.isLoading(state),
    error: arbitration.selectors.errorGet(state),
    txHash: arbitration.selectors.txHash(state)
  };
};

export default connect(
  mapStateToProps,
  {
    cancelArbitratorsActions: arbitration.actions.cancelArbitratorActions
  })(withRouter(SellerApproval));
