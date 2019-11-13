/*global web3*/
import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {withNamespaces} from "react-i18next";
import newBuy from "../../../features/newBuy";
import network from "../../../features/network";
import {connect} from "react-redux";

import EditContactList from '../../../components/EditContact/ContactList';

import {contactCodeRegExp} from '../../../utils/address';
import DOMPurify from 'dompurify';
import metadata from "../../../features/metadata";
import {Alert} from "reactstrap";

class ContactDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.username,
      contactCode: props.contactCode,
      contactMethod: 'Status'
    };
    this.validate(props.contactCode);
    props.footer.onPageChange(() => {
      // TODO change this to work with the other methods once the contract is changed
      props.setContactInfo({username: DOMPurify.sanitize(props.username), statusContactCode: DOMPurify.sanitize(this.state.contactCode)});
    });
  }

  componentDidMount() {
    if (!this.props.username) {
      return this.props.wizard.previous();
    }
    if (this.props.profile && this.props.profile.username) {
      this.props.setContactInfo({username: DOMPurify.sanitize(this.props.profile.username), statusContactCode: DOMPurify.sanitize(this.props.profile.statusContactCode)});
      return this.props.wizard.next();
    }
    if (!this.props.isEip1102Enabled) {
      this.props.footer.disableNext();
      this.props.enableEthereum();
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

  validate(contactCode) {
    if (this.props.isEip1102Enabled && contactCode) {
      if(!contactCodeRegExp.test(contactCode)){
        return this.props.footer.disableNext();
      }
      return this.props.footer.enableNext();
    }
    this.props.footer.disableNext();
  }

  changeContactCode = (contactCode) => {
    this.validate(contactCode);
    this.setState({contactCode});
  };

  changeContactMethod = (contactMethod) => {
    this.setState({contactMethod});
  };

  getContactCode = () => {
    if(!this.props.apiContactCode){
      this.props.getContactCode();
    } else {
      this.setState({ contactCode: this.props.apiContactCode });
    }
  };

  render() {
    return (<Fragment>
      {!this.props.isEip1102Enabled && <Alert color="warning">{this.props.t('ethereumEnable.buyContact')}</Alert>}

      <EditContactList isStatus={this.props.isStatus}
                       contactCode={this.state.contactCode}
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
  enableEthereum: PropTypes.func
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
    resolveENSName: network.actions.resolveENSName,
    enableEthereum: metadata.actions.enableEthereum
  }
  )(withNamespaces()(ContactDetails));
