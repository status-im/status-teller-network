/*global web3*/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";

import EditContact from '../../../components/EditContact';
import Loading from '../../../components/Loading';

import newSeller from "../../../features/newSeller";
import metadata from "../../../features/metadata";
import network from '../../../features/network';

import {contactCodeRegExp} from '../../../utils/address';

class Contact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.seller.username,
      statusContactCode: props.seller.statusContactCode,
      ready: false
    };
    this.validate(props.seller.username, props.seller.statusContactCode);
    props.footer.onPageChange(() => {
      props.setContactInfo({username: this.state.username, statusContactCode: this.state.statusContactCode});
    });
  }

  componentDidMount() {
    if (!this.props.seller.location) {
      return this.props.wizard.previous();
    }
    if (this.props.profile && this.props.profile.username) {
      this.props.setContactInfo({username: this.props.profile.username, statusContactCode: this.props.profile.statusContactCode});
      return this.props.wizard.next();
    }
    this.setState({ready: true});
  }

  componentDidUpdate(prevProps) {
    if (prevProps.statusContactCode !== this.props.statusContactCode) {
      this.changeStatusContactCode(this.props.statusContactCode);
    }
  }

  validate(username, statusContactCode) {
    if (username && statusContactCode) {
      if(statusContactCode.startsWith("0x") && !contactCodeRegExp.test(statusContactCode)){
        this.props.footer.disableNext();
      } else {
        return this.props.footer.enableNext();
      }
    }
    this.props.footer.disableNext();
  }

  changeStatusContactCode = (statusContactCode) => {
    this.validate(this.state.username, statusContactCode);
    this.setState({statusContactCode});
  };

  changeUsername = (username) => {
    this.validate(username, this.state.statusContactCode);
    this.setState({username});
  };

  getContactCode = () => {
    if(!this.props.statusContactCode){
      this.props.getContactCode();
    } else {
      this.setState({ statusContactCode: this.props.statusContactCode });
    }
  }

  render() {
    if (!this.state.ready) {
      return <Loading page/>;
    }

    return <EditContact isStatus={this.props.isStatus}
                         statusContactCode={this.state.statusContactCode}
                         username={this.state.username}
                         changeStatusContactCode={this.changeStatusContactCode}
                         getContactCode={this.getContactCode}
                         changeUsername={this.changeUsername}/>;
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
  profile: PropTypes.object
};

const mapStateToProps = state => ({
  seller: newSeller.selectors.getNewSeller(state),
  isStatus: network.selectors.isStatus(state),
  statusContactCode: network.selectors.getStatusContactCode(state),
  profile: metadata.selectors.getProfile(state, web3.eth.defaultAccount)
});

export default connect(
  mapStateToProps,
  {
    setContactInfo: newSeller.actions.setContactInfo,
    getContactCode: network.actions.getContactCode
  }
)(Contact);
