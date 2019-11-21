/*global web3*/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import DOMPurify from "dompurify";

import EditContactList from '../../../components/EditContact/ContactList';
import Loading from '../../../components/Loading';

import newSeller from "../../../features/newSeller";
import metadata from "../../../features/metadata";
import network from '../../../features/network';
import {getContactDataItem} from '../../../utils/strings';
import {contactCodeRegExp} from '../../../utils/address';

class Contact extends Component {
  constructor(props) {
    super(props);
    const username = props.seller && props.seller.username;
    const contactUsername = (props.seller && getContactDataItem(props.seller.contactData, 1)) ||  ((props.profile && getContactDataItem(props.profile.contactData, 1)) || "");
    const contactMethod = (props.seller && getContactDataItem(props.seller.contactData, 0)) ||  ((props.profile && getContactDataItem(props.profile.contactData, 0)) || "Status");

    this.state = {
      contactUsername,
      contactMethod,
      ready: false
    };
    this.validate(contactUsername, contactMethod);
    props.footer.onPageChange(() => {
      props.setContactInfo({username: DOMPurify.sanitize(username), contactMethod: DOMPurify.sanitize(this.state.contactMethod), contactUsername: DOMPurify.sanitize(this.state.contactUsername)});
    });
  }

  componentDidMount() {
    if (!this.props.seller.username) {
      return this.props.wizard.previous();
    }

    if (this.props.profile && this.props.profile.statusContactCode) {
      this.props.setContactInfo({username: DOMPurify.sanitize(this.props.profile.username), statusContactCode: DOMPurify.sanitize(this.props.profile.statusContactCode)});
      return this.props.wizard.next();
    }
    this.setState({ready: true});
  }

  componentDidUpdate(prevProps) {
    if (prevProps.statusContactCode !== this.props.statusContactCode) {
      this.changeContactCode(this.props.statusContactCode);
    }
  }

  validate(contactUsername, contactMethod) {
    if (contactUsername) {
      if(contactMethod === 'Status' && !contactCodeRegExp.test(contactUsername)){
        return this.props.footer.disableNext();
      }
      return this.props.footer.enableNext();
    }
    this.props.footer.disableNext();
  }

  changeContactCode = (contactUsername) => {
    this.validate(contactUsername, this.state.contactMethod);
    this.setState({contactUsername});
  };

  changeContactMethod = (contactMethod) => {
    this.setState({contactMethod});
  };

  getContactCode = () => {
    if(!this.props.statusContactCode){
      this.props.getContactCode();
    } else {
      this.setState({ contactCode: this.props.statusContactCode });
    }
  };

  render() {
    if (!this.state.ready) {
      return <Loading page/>;
    }

    return <EditContactList isStatus={this.props.isStatus}
                            contactCode={this.state.contactUsername}
                            contactMethod={this.state.contactMethod}
                            changeContactCode={this.changeContactCode}
                            changeContactMethod={this.changeContactMethod}
                            getContactCode={this.getContactCode}
                            resolveENSName={this.props.resolveENSName}
                            ensError={this.props.ensError}/>;
  }
}

Contact.propTypes = {
  footer: PropTypes.object,
  wizard: PropTypes.object,
  setContactInfo: PropTypes.func,
  seller: PropTypes.object,
  addOffer: PropTypes.func,
  isStatus: PropTypes.bool,
  getContactCode: PropTypes.func,
  statusContactCode: PropTypes.string,
  profile: PropTypes.object,
  resolveENSName: PropTypes.func,
  ensError: PropTypes.string
};

const mapStateToProps = state => ({
  seller: newSeller.selectors.getNewSeller(state),
  isStatus: network.selectors.isStatus(state),
  statusContactCode: network.selectors.getStatusContactCode(state),
  ensError: network.selectors.getENSError(state),
  profile: metadata.selectors.getProfile(state, web3.eth.defaultAccount)
});

export default connect(
  mapStateToProps,
  {
    setContactInfo: newSeller.actions.setContactInfo,
    getContactCode: network.actions.getContactCode,
    resolveENSName: network.actions.resolveENSName
  }
)(Contact);
