import React, {Component, Fragment} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";

import network from "../../features/network";
import metadata from "../../features/metadata";

import Loading from '../../components/Loading';
import ErrorInformation from '../../components/ErrorInformation';
import EditContact from '../../components/EditContact';
import UpdateButton from './components/UpdateButton';
import { States } from '../../utils/transaction';
import DOMPurify from "dompurify";
import {contactCodeRegExp} from "../../components/EditContact/validators";
import EditContactList from "../../components/EditContact/ContactList";

class EditMyContact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.profile ? props.profile.username || '' : '',
      statusContactCode: props.profile ? props.profile.statusContactCode || '' : '',
      updateDisabled: props.profile ? this.isUpdateDisabled(props.profile.username, props.profile.statusContactCode) : true,
      contactMethod: 'Status'
    };
  }

  componentDidMount() {
    this.props.loadProfile(this.props.address);
  }

  componentDidUpdate(prevProps) {
    if(!prevProps.profile && this.props.profile){
      this.setState({
        username: this.props.profile.username || '',
        statusContactCode: this.props.profile.statusContactCode || '',
        updateDisabled: this.isUpdateDisabled(this.props.profile.username, this.props.profile.statusContactCode)
      });
    }

    if (this.props.updateUserStatus === States.success) {
      this.props.resetUpdateUserStatus();
      this.props.history.push('/profile');
    }

    if (prevProps.statusContactCode !== this.props.statusContactCode) {
      this.changeStatusContactCode(this.props.statusContactCode);
    }
  }

  update = () => {
    this.props.updateUser({
      address: this.props.address,
      username: DOMPurify.sanitize(this.state.username),
      statusContactCode: DOMPurify.sanitize(this.state.statusContactCode),
      location: DOMPurify.sanitize(this.props.profile.location)
    });
  };

  isUpdateDisabled(username, statusContactCode) {
    return !username || !statusContactCode || !contactCodeRegExp.test(statusContactCode);
  }

  validate(username, statusContactCode) {
    this.setState({updateDisabled: this.isUpdateDisabled(username, statusContactCode)});
  }

  changeStatusContactCode = (statusContactCode) => {
    this.validate(this.state.username, statusContactCode);
    this.setState({statusContactCode});
  };

  changeContactMethod = (contactMethod) => {
    this.setState({contactMethod});
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
  };

  render() {
    if(!this.props.profile){
      return <Loading />;
    }

    switch(this.props.updateUserStatus){
      case States.pending:
        return <Loading mining/>;
      case States.failed:
        return <ErrorInformation transaction retry={this.update} cancel={this.props.resetUpdateUserStatus}/>;
      case States.none:
        return (
          <Fragment>
            <EditContact username={this.state.username}
                         changeUsername={this.changeUsername}/>

            <EditContactList isStatus={this.props.isStatus}
                             contactMethod={this.state.contactMethod}
                             contactCode={this.state.statusContactCode}
                             changeContactCode={this.changeStatusContactCode}
                             getContactCode={this.getContactCode}
                             changeContactMethod={this.changeContactMethod}
                             resolveENSName={this.props.resolveENSName}
                             ensError={this.props.ensError}/>

            <UpdateButton disabled={this.state.updateDisabled} onClick={this.update}/>
        </Fragment>
        );
      default:
        return <Fragment/>;
    }
  }
}

EditMyContact.propTypes = {
  history: PropTypes.object,
  profile: PropTypes.object,
  loadProfile: PropTypes.func,
  address: PropTypes.string,
  updateUser: PropTypes.func,
  updateUserStatus: PropTypes.string,
  resetUpdateUserStatus: PropTypes.func,
  getContactCode: PropTypes.func,
  isStatus: PropTypes.bool,
  statusContactCode: PropTypes.string,
  resolveENSName: PropTypes.func,
  ensError: PropTypes.string
};

const mapStateToProps = state => {
  const address = network.selectors.getAddress(state) || '';
  return {
    address,
    profile: metadata.selectors.getProfile(state, address),
    updateUserStatus: metadata.selectors.getUpdateUserStatus(state),
    isStatus: network.selectors.isStatus(state),
    ensError: network.selectors.getENSError(state),
    statusContactCode: network.selectors.getStatusContactCode(state)
  };
};

export default connect(
  mapStateToProps,
  {
    loadProfile: metadata.actions.load,
    updateUser: metadata.actions.updateUser,
    resetUpdateUserStatus: metadata.actions.resetUpdateUserStatus,
    getContactCode: network.actions.getContactCode,
    resolveENSName: network.actions.resolveENSName
  }
)(withRouter(EditMyContact));
