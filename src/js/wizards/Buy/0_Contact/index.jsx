/*global web3*/
import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import EditContact from '../../../components/EditContact';
import newBuy from "../../../features/newBuy";
import network from "../../../features/network";
import {connect} from "react-redux";
import metadata from "../../../features/metadata";
import Loading from '../../../components/Loading';
import {contactCodeRegExp} from '../../../utils/address';
import DOMPurify from 'dompurify';

class Contact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.username,
      statusContactCode: props.statusContactCode,
      ready: false
    };
    this.validate(props.username, props.statusContactCode);
    props.footer.enableNext();
    props.footer.onPageChange(() => {
      props.signMessage(this.state.username, this.state.statusContactCode);
      props.setContactInfo({username: DOMPurify.sanitize(this.state.username), statusContactCode: DOMPurify.sanitize(this.state.statusContactCode)});
    });
  }

  componentDidMount() {
    if (this.props.profile && this.props.profile.username) {
      this.props.setContactInfo({username: DOMPurify.sanitize(this.props.profile.username), statusContactCode: DOMPurify.sanitize(this.props.profile.statusContactCode)});
    } else {
      this.validate(this.props.username, this.props.statusContactCode);
    }

    this.setState({ready: true});
  }

  componentDidUpdate(prevProps) {
    if(!prevProps.apiContactCode && this.props.apiContactCode){
      this.changeStatusContactCode(this.props.apiContactCode);
    }

    if (prevProps.statusContactCode !== this.props.statusContactCode) {
      this.changeStatusContactCode(this.props.statusContactCode);
    }
  }

  validate(username, statusContactCode) {
    if (username && statusContactCode) {
      if(!contactCodeRegExp.test(statusContactCode)){
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
    if(!this.props.apiContactCode){
      this.props.getContactCode();
    } else {
      this.setState({ statusContactCode: this.props.apiContactCode });
    }
  }

  render() {
    if (!this.state.ready) {
      return <Loading page/>;
    }
    return (
      <EditContact isStatus={this.props.isStatus}
                   statusContactCode={this.state.statusContactCode}
                   username={this.state.username}
                   changeStatusContactCode={this.changeStatusContactCode}
                   changeUsername={this.changeUsername}
                   getContactCode={this.getContactCode}
                   resolveENSName={this.props.resolveENSName}
                   ensError={this.props.ensError} />
    );
  }
}

Contact.propTypes = {
  history: PropTypes.object,
  footer: PropTypes.object,
  wizard: PropTypes.object,
  setContactInfo: PropTypes.func,
  username: PropTypes.string,
  statusContactCode: PropTypes.string,
  apiContactCode: PropTypes.string,
  isStatus: PropTypes.bool,
  getContactCode: PropTypes.func,
  profile: PropTypes.object,
  resolveENSName: PropTypes.func,
  ensError: PropTypes.string,
  signMessage: PropTypes.func
};

const mapStateToProps = state => ({
  statusContactCode: newBuy.selectors.statusContactCode(state),
  apiContactCode: network.selectors.getStatusContactCode(state),
  username: newBuy.selectors.username(state),
  isStatus: network.selectors.isStatus(state),
  ensError: network.selectors.getENSError(state),
  profile: metadata.selectors.getProfile(state, web3.eth.defaultAccount)
});

export default connect(
  mapStateToProps,
  {
    setContactInfo: newBuy.actions.setContactInfo,
    getContactCode: network.actions.getContactCode,
    resolveENSName: network.actions.resolveENSName,
    signMessage: metadata.actions.signMessage
  }
  )(withRouter(Contact));
