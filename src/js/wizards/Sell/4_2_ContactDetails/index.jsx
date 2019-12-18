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
import {stringToContact} from '../../../utils/strings';
import {contactCodeRegExp} from '../../../utils/address';
import {STATUS} from '../../../constants/contactMethods';

class Contact extends Component {
  constructor(props) {
    super(props);

    const seller = props.seller;
    const profile = props.profile;
    const sellerContactObject = stringToContact(seller && seller.contactData);
    const profileContactObject = stringToContact(profile && profile.contactData);

    const username = seller && seller.username;
    const contactUsername = (seller && sellerContactObject.userId) || (profile && profileContactObject.userId) || "";
    const contactMethod = (seller && sellerContactObject.method) || (profile && profileContactObject.method) || "Status";

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
    this.setState({ready: true});
  }

  componentDidUpdate(prevProps) {
    if (prevProps.statusContactCode !== this.props.statusContactCode) {
      this.changeContactCode(this.props.statusContactCode);
    }
  }

  validate(contactUsername, contactMethod) {
    if (contactUsername) {
      if(contactMethod === STATUS && !contactCodeRegExp.test(contactUsername)){
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
