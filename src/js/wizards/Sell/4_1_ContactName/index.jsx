/*global web3*/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import DOMPurify from "dompurify";

import EditContact from '../../../components/EditContact';
import Loading from '../../../components/Loading';

import newSeller from "../../../features/newSeller";
import metadata from "../../../features/metadata";
import network from '../../../features/network';

class Contact extends Component {
  constructor(props) {
    super(props);
    const username = (props.seller && props.seller.username) || ((props.profile && props.profile.username) || "");
    this.state = {
      username,
      ready: false
    };
    this.validate(username);
    props.footer.onPageChange(() => {
      props.setContactInfo({username: DOMPurify.sanitize(this.state.username)});
    });
  }

  componentDidMount() {
    if (!this.props.seller.location && this.props.seller.location !== '') {
      return this.props.wizard.previous();
    }

    if (this.props.profile && this.props.profile.username) {
      this.props.setContactInfo({username: DOMPurify.sanitize(this.props.profile.username)});
      return this.props.wizard.next();
    }
    this.setState({ready: true});
  }

  validate(username) {
    if (username) {
        return this.props.footer.enableNext();
    }
    this.props.footer.disableNext();
  }

  changeUsername = (username) => {
    this.validate(username);
    this.setState({username});
  };

  render() {
    if (!this.state.ready) {
      return <Loading page/>;
    }

    return <EditContact username={this.state.username} changeUsername={this.changeUsername}/>;
  }
}

Contact.propTypes = {
  footer: PropTypes.object,
  wizard: PropTypes.object,
  setContactInfo: PropTypes.func,
  seller: PropTypes.object,
  addOffer: PropTypes.func,
  isStatus: PropTypes.bool,
  profile: PropTypes.object
};

const mapStateToProps = state => ({
  seller: newSeller.selectors.getNewSeller(state),
  isStatus: network.selectors.isStatus(state),
  profile: metadata.selectors.getProfile(state, web3.eth.defaultAccount)
});

export default connect(
  mapStateToProps,
  {
    setContactInfo: newSeller.actions.setContactInfo
  }
)(Contact);
