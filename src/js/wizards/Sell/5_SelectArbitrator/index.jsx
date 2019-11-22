/* global web3 */
import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import newSeller from "../../../features/newSeller";
import arbitration from "../../../features/arbitration";
import network from "../../../features/network";
import metadata from "../../../features/metadata";
import ArbitratorSelectorForm from "./components/ArbitratorSelectorForm";
import {addressCompare} from '../../../utils/address';
import DOMPurify from "dompurify";
import {stringToContact} from '../../../utils/strings';

class SelectArbitrator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedArbitrator: props.seller.arbitrator,
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
    if ((!prevProps.arbitrators && this.props.arbitrators) || prevProps.arbitrators.length !== this.props.arbitrators.length || Object.keys(this.props.users).length !== Object.keys(this.props.arbitrators).length) {
      Object.keys(this.props.arbitrators).forEach(arbitratorAddr => {
        if (!this.props.users[arbitratorAddr] && !this.loadedUsers.includes(arbitratorAddr)) {
          this.props.getUser(arbitratorAddr);
          this.loadedUsers.push(arbitratorAddr);
        }
      });
    }
  }

  componentDidMount() {
    // Prefill username and contact code because we skipped prev. wizard page
    if (this.props.profile && !this.props.seller.username) {
      const contactObject = stringToContact(this.props.profile && this.props.profile.contactData);
      this.props.setContactInfo({username: DOMPurify.sanitize(this.props.profile.username), contactMethod: DOMPurify.sanitize(contactObject.method), contactUsername: DOMPurify.sanitize(contactObject.userId)});
    } else if(!this.props.seller.username) return this.props.wizard.previous();
    
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

  render() {
    return (
      <Fragment>
        <ArbitratorSelectorForm
          value={this.state.selectedArbitrator}
          arbitrators={Object.keys(this.props.arbitrators).filter(x => !addressCompare(x, this.props.address))}
          changeArbitrator={this.changeArbitrator} users={this.props.users}
        />
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
  getUser: PropTypes.func,
  profile: PropTypes.object,
  setContactInfo: PropTypes.func
};

const mapStateToProps = state => ({
  address: network.selectors.getAddress(state) || '',
  seller: newSeller.selectors.getNewSeller(state),
  arbitrators: arbitration.selectors.arbitrators(state),
  users: metadata.selectors.getAllUsers(state),
  profile: metadata.selectors.getProfile(state, web3.eth.defaultAccount)

});

export default connect(
  mapStateToProps,
  {
    setArbitrator: newSeller.actions.setArbitrator,
    getArbitrators: arbitration.actions.getArbitrators,
    getUser: metadata.actions.loadUserOnly,
    setContactInfo: newSeller.actions.setContactInfo
  }
)(SelectArbitrator);
