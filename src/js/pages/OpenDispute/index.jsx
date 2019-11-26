import React, {Component} from 'react';
import {Button, ButtonGroup} from 'reactstrap';
import Loading from '../../components/Loading';
import ConfirmDialog from '../../components/ConfirmDialog';
import PropTypes from 'prop-types';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import arbitration from '../../features/arbitration';
import network from '../../features/network';
import CheckButton from '../../ui/CheckButton';

import successImage from '../../../images/success.png';
import {ARBITRATION_UNSOLVED, UNRESPONSIVE, PAYMENT, OTHER} from "../../features/arbitration/constants";
import { addressCompare } from '../../utils/address';

class OpenDispute extends Component {
  state = {
    motive: '',
    displayDialog: false
  }

  constructor(props){
    super(props);
    props.loadArbitration(props.escrowId);
  }

  componentDidUpdate() {
    if (this.props.escrow.arbitration) {
      if(this.props.escrow.arbitration.open || this.props.escrow.arbitration.result !== ARBITRATION_UNSOLVED){
        this.props.history.push('/');
      }
    }
  }

  setMotive = motive => () => {
    this.setState({motive});
  }

  handleChange = (e) => {
    this.setState({motive: e.target.value});
  }

  displayDialog = show => () => {
    this.setState({displayDialog: show});
  };

  goToProfile = () => {
    this.props.history.push('/profile');
  }

  handleClickDialog = escrowId => () => {
    this.props.openDispute(escrowId, this.state.motive);
  }

  render(){
    const {escrow, loading, receipt, address} = this.props;

    if(!escrow) return <Loading page />;
    if(loading) return <Loading mining />;

    const isBuyer = addressCompare(escrow.buyer, address);

    if(receipt) return (
      <div className="text-center p-5">
        <img src={successImage} alt="Success" width="160" height="160" className="mt-5" />
        <h2 className="mt-5">Your dispute was successfully open</h2>
        <p className="text-muted">Follow the progress of your dispute in the profile.</p>
        <p>
          <Button color="primary" onClick={this.goToProfile}>Okay</Button>
        </p>
    </div>
    );

    return (
      <div className="openDispute">
        <h2>Open dispute</h2>
        <p>Describe details of your trade</p>
        <ButtonGroup vertical className="w-100">
          <CheckButton size="l" active={this.state.motive === UNRESPONSIVE} onClick={this.setMotive(UNRESPONSIVE)}>
          <b>Unresponsive</b>
          { isBuyer && <span className="text-muted text-small"><br />you have made the payment but seller is unresponsive</span>}
          { !isBuyer && <span className="text-muted text-small"><br />buyer has marked trade as paid but is unresponsive and inactive</span>}
          </CheckButton>
          <CheckButton size="l" active={this.state.motive === PAYMENT} onClick={this.setMotive(PAYMENT)}>
          <b>Payment issue</b>
          { isBuyer && <span className="text-muted text-small"><br />you have made the payment, seller is responsive but states that something is wrong with the payment process, refuses to release</span> }
          { !isBuyer && <span className="text-muted text-small"><br />buyer is active, has made an attempt to pay, but there are issues with the payment</span>}
          </CheckButton>
          <CheckButton size="l" active={this.state.motive === OTHER} onClick={this.setMotive(OTHER)}>
          <b>Other</b>
          { isBuyer && <span className="text-muted text-small"><br />any other reason</span> }
          </CheckButton>
        </ButtonGroup>
        <p className="text-muted">The process of resolving your dispute could take up to 5 days.</p>
        <p className="text-center">
          <Button color="primary" disabled={!this.state.motive} onClick={this.displayDialog(true)}>Send</Button>
        </p>
        <ConfirmDialog display={this.state.displayDialog} onConfirm={this.handleClickDialog(escrow.escrowId)} onCancel={this.displayDialog(false)} title="Open dispute" content="Are you sure?" cancelText="No" />
      </div>
    );
  }
}

OpenDispute.propTypes = {
  address: PropTypes.string,
  history: PropTypes.object,
  escrow: PropTypes.object,
  escrowId: PropTypes.string,
  loadArbitration: PropTypes.func,
  openDispute: PropTypes.func,
  loading: PropTypes.bool,
  receipt: PropTypes.object
};


const mapStateToProps = (state, props) => {
  return {
    address: network.selectors.getAddress(state) || "",
    escrowId:  props.match.params.id.toString(),
    escrow: arbitration.selectors.getArbitration(state),
    loading: arbitration.selectors.loading(state),
    receipt: arbitration.selectors.receipt(state)
  };
};

export default connect(
  mapStateToProps,
  {
    loadArbitration: arbitration.actions.loadArbitration,
    openDispute: arbitration.actions.openDispute
  }
)(withRouter(OpenDispute));

