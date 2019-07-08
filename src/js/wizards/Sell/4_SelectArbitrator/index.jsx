import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import ConfirmDialog from "../../../components/ConfirmDialog";
import newSeller from "../../../features/newSeller";
import arbitration from "../../../features/arbitration";
import network from "../../../features/network";
import metadata from "../../../features/metadata";
import ArbitratorSelectorForm from "./components/ArbitratorSelectorForm";
import {addressCompare, zeroAddress} from '../../../utils/address';

class SelectArbitrator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedArbitrator: props.seller.arbitrator,
      noArbitrator: false,
      displayDialog: false
    };
    this.loadedUsers = [];

    props.getArbitrators(props.address);

    this.validate(props.seller.arbitrator);

    props.footer.onPageChange(() => {
      props.setArbitrator(this.state.selectedArbitrator);
    });
  }

  componentDidUpdate(prevProps) {
    if ((!prevProps.arbitrators && this.props.arbitrators) || prevProps.arbitrators.length !== this.props.arbitrators.length || Object.keys(this.props.users).length !== this.props.arbitrators.length) {
      Object.keys(this.props.arbitrators).forEach(arbitratorAddr => {
        if (!this.props.users[arbitratorAddr] && !this.loadedUsers.includes(arbitratorAddr)) {
          this.props.getUser(arbitratorAddr);
          this.loadedUsers.push(arbitratorAddr);
        }
      });
    }
  }

  componentDidMount() {
    if (!this.props.seller.paymentMethods.length) {
      return this.props.wizard.previous();
    }
    this.setState({ready: true});
  }

  validate(selectedArbitrator) {
    if (selectedArbitrator) {
      return this.props.footer.enableNext();
    }
    this.props.footer.disableNext();
  }

  changeArbitrator = (selectedArbitrator) => {
    if (!selectedArbitrator) {
      selectedArbitrator = '';
    }
    this.validate(selectedArbitrator);
    this.setState({selectedArbitrator});
  };

  selectNoArbitrator = () => {
    this.setState({displayDialog: true});
  }

  noArbitrationSelected = () => {
    this.setState(prevState => ({
      noArbitrator: !prevState.noArbitrator,
      selectedArbitrator: zeroAddress,
      displayDialog: false
    }), () => {
      this.validate(zeroAddress);
    });
  }

  displayDialog = show => (e) => {
    if(e) e.preventDefault();
    this.setState({displayDialog: show});
    return false;
  };

  render() {
    return (
      <Fragment>
        <ArbitratorSelectorForm
          value={this.state.selectedArbitrator}
          arbitrators={Object.keys(this.props.arbitrators).filter(x => !addressCompare(x, this.props.address))}
          changeArbitrator={this.changeArbitrator} users={this.props.users}
          onSelectNoArbitrator={this.selectNoArbitrator} noArbitrator={this.state.noArbitrator}
        />
        <ConfirmDialog display={this.state.displayDialog} onConfirm={this.noArbitrationSelected} onCancel={this.displayDialog(false)} title="Use no arbitrator in this offer" content="Are you sure? Offers without an arbitrator are riskier for buyers and seller participating in an escrow since disputes cannot be created" cancelText="No" />
      </Fragment>
      );
  }
}

SelectArbitrator.propTypes = {
  wizard: PropTypes.object,
  footer: PropTypes.object,
  seller: PropTypes.object,
  address: PropTypes.string,
  arbitrators: PropTypes.object,
  users: PropTypes.object,
  setArbitrator: PropTypes.func,
  getArbitrators: PropTypes.func,
  getUser: PropTypes.func
};

const mapStateToProps = state => ({
  address: network.selectors.getAddress(state) || '',
  seller: newSeller.selectors.getNewSeller(state),
  arbitrators: arbitration.selectors.arbitrators(state),
  users: metadata.selectors.getAllUsers(state)
});

export default connect(
  mapStateToProps,
  {
    setArbitrator: newSeller.actions.setArbitrator,
    getArbitrators: arbitration.actions.getArbitrators,
    getUser: metadata.actions.loadUserOnly
  }
)(SelectArbitrator);
