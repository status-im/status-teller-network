import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";

import network from "../features/network";
import metadata from "../features/metadata";

import Loading from '../components/ui/Loading';
import ContactForm from '../components/ContactForm';
import UpdateUser from '../components/Profile/UpdateUser';
import { States } from '../utils/transaction';

class EditProfileContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.profile.username || '',
      statusContactCode: props.profile.statusContactCode || '',
      updateDisabled: !props.profile.username || !props.profile.statusContactCode
    };
  }

  componentDidMount() {
    this.props.loadProfile(this.props.address);
  }

  componentDidUpdate(prevProps) {
    if (this.props.updateUserStatus === States.success) {
      this.props.resetUpdateUserStatus();
      this.props.history.push('/profile');
    }

    if (prevProps.statusContactCode !== this.props.statusContactCode) {
      this.changeStatusContactCode(this.props.statusContactCode);
    }
  }

  update = () => {
    this.props.updateUser({...this.state, location: this.props.profile.location});
  };

  validate(username, statusContactCode) {
    this.setState({updateDisabled: !username || !statusContactCode});
  }
  
  changeStatusContactCode = (statusContactCode) => {
    this.validate(this.state.username, statusContactCode);
    this.setState({statusContactCode});

  };
  
  changeUsername = (username) => {
    this.validate(username, this.state.statusContactCode);
    this.setState({username});
  };

  render() {
    if (this.props.updateUserStatus === States.pending) {
      return <Loading mining/>;
    }

    if (this.props.updateUserStatus === States.none) {
      return (
        <React.Fragment>
          <ContactForm isStatus={this.props.isStatus}
                       statusContactCode={this.state.statusContactCode} 
                       username={this.state.username}
                       changeStatusContactCode={this.changeStatusContactCode}
                       changeUsername={this.changeUsername}
                       getContactCode={this.props.getContactCode}
                       />
          <UpdateUser disabled={this.state.updateDisabled} onClick={this.update}/>
      </React.Fragment>
      );
    }
  
    return <React.Fragment></React.Fragment>;
  }
}

EditProfileContainer.propTypes = {
  history: PropTypes.object,
  profile: PropTypes.object,
  loadProfile: PropTypes.func,
  address: PropTypes.string,
  updateUser: PropTypes.func,
  updateUserStatus: PropTypes.string,
  resetUpdateUserStatus: PropTypes.func,
  getContactCode: PropTypes.func,
  isStatus: PropTypes.bool,
  statusContactCode: PropTypes.string
};

const mapStateToProps = state => {
  const address = network.selectors.getAddress(state) || '';
  return {
    address,
    profile: metadata.selectors.getProfile(state, address),
    updateUserStatus: metadata.selectors.getUpdateUserStatus(state),
    isStatus: network.selectors.isStatus(state),
    statusContactCode: network.selectors.getStatusContactCode(state)
  };
};

export default connect(
  mapStateToProps,
  {
    loadProfile: metadata.actions.load,
    updateUser: metadata.actions.updateUser,
    resetUpdateUserStatus: metadata.actions.resetUpdateUserStatus,
    getContactCode: network.actions.getContactCode
  }
)(withRouter(EditProfileContainer));
