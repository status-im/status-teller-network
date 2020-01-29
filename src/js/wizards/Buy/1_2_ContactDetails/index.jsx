/*global web3*/
import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from "react-i18next";
import newBuy from "../../../features/newBuy";
import network from "../../../features/network";
import {connect} from "react-redux";

import EditContactList from '../../../components/EditContact/ContactList';

import {contactCodeRegExp} from '../../../utils/address';
import DOMPurify from 'dompurify';
import metadata from "../../../features/metadata";
import {Alert} from "reactstrap";
import {stringToContact} from '../../../utils/strings';
import {STATUS} from '../../../constants/contactMethods';

class ContactDetails extends Component {
  constructor(props) {
    super(props);

    const contactObj = stringToContact(props.contactCode);
    const contactUsername = contactObj.userId;
    const contactMethod = contactObj.method || STATUS;

    this.state = {
      username: props.username,
      contactUsername,
      contactMethod
    };

    this.validate(contactUsername, contactMethod);
    props.footer.onPageChange(() => {
      props.setContactInfo({username: DOMPurify.sanitize(props.username), contactUsername: DOMPurify.sanitize(this.state.contactUsername), contactMethod: DOMPurify.sanitize(this.state.contactMethod)});
    });
  }

  componentDidMount() {
    if (this.props.profile && this.props.profile.username) {
      const contactObj = stringToContact(this.props.profile.contactData);
      this.props.setContactInfo({username: DOMPurify.sanitize(this.props.profile.username), contactUsername: DOMPurify.sanitize(contactObj.userId), contactMethod: DOMPurify.sanitize(contactObj.method)});
      return this.props.wizard.next();
    } else if (!this.props.username) {
      return this.props.wizard.previous();
    }

    if (!this.props.isEip1102Enabled) {
      this.props.footer.disableNext();
    }
  }

  componentDidUpdate(prevProps) {
    if(!prevProps.apiContactCode && this.props.apiContactCode) {
      this.changeContactCode(this.props.apiContactCode);
    }
    if (prevProps.contactCode !== this.props.contactCode) {
      this.changeContactCode(this.props.contactCode);
    }

    if (!prevProps.isEip1102Enabled && this.props.isEip1102Enabled) {
      this.validate(this.state.username, this.state.contactCode);
    }
  }

  validate(contactUsername, contactMethod) {
    if (this.props.isEip1102Enabled && contactUsername) {
      if(contactMethod === STATUS && !contactCodeRegExp.test(contactUsername)){
        return this.props.footer.disableNext();
      }
      return this.props.footer.enableNext();
    }
    this.props.footer.disableNext();
  }

  changeContactCode = (contactUsername) => {
    this.validate(contactUsername);
    this.setState({contactUsername});
  };

  changeContactMethod = (contactMethod) => {
    this.setState({contactMethod});
  };

  getContactCode = () => {
    if(!this.props.apiContactCode){
      this.props.getContactCode();
    } else {
      this.changeContactCode(this.props.apiContactCode);
    }
  };

  render() {
    if (this.props.profile && this.props.profile.username) return null;

    return (<Fragment>
      {!this.props.isEip1102Enabled && <Alert color="warning">{this.props.t('ethereumEnable.buyContact')}</Alert>}

      <EditContactList isStatus={this.props.isStatus}
                       contactCode={this.state.contactUsername}
                       contactMethod={this.state.contactMethod}
                       changeContactCode={this.changeContactCode}
                       changeContactMethod={this.changeContactMethod}
                       getContactCode={this.getContactCode}
                       resolveENSName={this.props.resolveENSName}
                       ensError={this.props.ensError}/>
    </Fragment>);
  }
}

ContactDetails.propTypes = {
  t: PropTypes.func,
  footer: PropTypes.object,
  wizard: PropTypes.object,
  setContactInfo: PropTypes.func,
  username: PropTypes.string,
  contactCode: PropTypes.string,
  apiContactCode: PropTypes.string,
  isStatus: PropTypes.bool,
  getContactCode: PropTypes.func,
  profile: PropTypes.object,
  resolveENSName: PropTypes.func,
  ensError: PropTypes.string,
  isEip1102Enabled: PropTypes.bool,
};

const mapStateToProps = state => {
  return {
    contactCode: newBuy.selectors.statusContactCode(state),
    apiContactCode: network.selectors.getStatusContactCode(state),
    username: newBuy.selectors.username(state),
    isStatus: network.selectors.isStatus(state),
    ensError: network.selectors.getENSError(state),
    profile: metadata.selectors.getProfile(state, web3.eth.defaultAccount),
    isEip1102Enabled: metadata.selectors.isEip1102Enabled(state)
  };
};

export default connect(
  mapStateToProps,
  {
    setContactInfo: newBuy.actions.setContactInfo,
    getContactCode: network.actions.getContactCode,
    resolveENSName: network.actions.resolveENSName
  }
  )(withTranslation()(ContactDetails));
