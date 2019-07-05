import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import {withRouter} from "react-router-dom";
import network from '../../features/network';
import arbitration from '../../features/arbitration';
import metadata from '../../features/metadata';
import Loading from '../../components/Loading';
import ErrorInformation from '../../components/ErrorInformation';
import PropTypes from 'prop-types';
import BootstrapSwitchButton from 'bootstrap-switch-button-react';


class SellerApproval extends Component {

  componentDidMount(){
    this.props.checkLicenseOwner();
  }

  onToggleCheckbox = (checked) => {
    console.log(checked);
    this.props.changeAcceptEveryone(checked);
  }

  render(){
    const {loading, error, txHash, cancelArbitratorsActions, profile, acceptsEveryone} = this.props;
    if(error) {
      return <ErrorInformation transaction message={error} cancel={cancelArbitratorsActions}/>;
    }

    if(!profile.isArbitrator) {
      return <ErrorInformation message={"This feature is only available to arbitrators"}/>;
    }

    if(loading) return <Loading mining={true} txHash={txHash} />;

    return (
    <Fragment>
        <h2 className="mb-4">Seller Management</h2>
        <h3 className="mb-2">Accept all sellers</h3>
        {<BootstrapSwitchButton onlabel="ON" offlabel="OFF" checked={acceptsEveryone} onChange={this.onToggleCheckbox}/>}

        <p><br /><br /><br />TODO: show list of requests for arbitrator</p>
        
    </Fragment>
    );
  }
}

SellerApproval.propTypes = {
  address: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.string,
  txHash: PropTypes.string,
  requestArbitrator: PropTypes.func,
  cancelArbitratorsActions: PropTypes.func,
  changeAcceptEveryone: PropTypes.func,
  checkLicenseOwner: PropTypes.func,
  acceptsEveryone: PropTypes.bool,
  profile: PropTypes.object
};


const mapStateToProps = state => {
  const address = network.selectors.getAddress(state) || '';
  return {
    address,
    loading: arbitration.selectors.isLoading(state),
    error: arbitration.selectors.errorGet(state),
    txHash: arbitration.selectors.txHash(state),
    profile: metadata.selectors.getProfile(state, address) ,
    acceptsEveryone: arbitration.selectors.acceptsEveryone(state)
  };
};

export default connect(
  mapStateToProps,
  {
    cancelArbitratorsActions: arbitration.actions.cancelArbitratorActions,
    changeAcceptEveryone: arbitration.actions.changeAcceptEveryone,
    checkLicenseOwner: arbitration.actions.checkLicenseOwner
  })(withRouter(SellerApproval));
