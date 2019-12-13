import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import LocationForm from "../../components/EditLocation/SellerPosition";
import {States} from "../../utils/transaction";
import DOMPurify from "dompurify";
import {withRouter} from "react-router-dom";
import {stringToContact} from "../../utils/strings";
import network from "../../features/network";
import metadata from "../../features/metadata";
import {Button} from "reactstrap";
import Loading from "../../components/Loading";
import ErrorInformation from "../../components/ErrorInformation";
import EditContact from "../../components/EditContact";
import EditContactList from "../../components/EditContact/ContactList";
import UpdateButton from "../EditMyContact/components/UpdateButton";

const REDIRECT_PATH = '/profile';

class EditLocation extends Component {
  constructor(props) {
    super(props);

    const profile = props.profile;

    this.state = {
      location: profile.location
    };
    if (!profile) {
      this.props.loadProfile(this.props.address);
    }
  }

  componentDidUpdate(prevProps) {
    if(!prevProps.profile && this.props.profile){
      this.setState({
        location: this.props.profile.location
      });
    }

    if (this.props.updateUserStatus === States.success) {
      this.props.resetUpdateUserStatus();
      this.props.history.push(REDIRECT_PATH);
    }
  }

  update = () => {
    const location = DOMPurify.sanitize(this.state.location);
    if (location === this.props.profile.location) {
      // user didn't change it's location, so we just act as it it worked
      return this.props.history.push(REDIRECT_PATH);
    }

    const contactObject = stringToContact(this.props.profile.contactData);
    this.props.updateUser({
      address: this.props.address,
      username: DOMPurify.sanitize(this.props.profile.username),
      contactMethod: contactObject.method,
      contactData:  DOMPurify.sanitize(contactObject.userId),
      location: DOMPurify.sanitize(location)
    });
  };

  changeLocation = (location) => {
    this.setState({location});
  };

  render() {
    if (!this.props.profile) {
      return 'Loading..';
    }

    switch (this.props.updateUserStatus) {
      case States.pending:
        return <Loading mining/>;
      case States.failed:
        return <ErrorInformation transaction retry={this.update} cancel={this.props.resetUpdateUserStatus}/>;
      case States.none:
        return (
          <Fragment>
            <LocationForm location={this.state.location} changeLocation={this.changeLocation}/>
            <div className="text-center">
              <Button onClick={this.update} color="primary">Update</Button>
            </div>
          </Fragment>
        );
      default:
        return <Fragment/>;
    }
  }
}

EditLocation.propTypes = {
  history: PropTypes.object,
  profile: PropTypes.object,
  loadProfile: PropTypes.func,
  updateUserStatus: PropTypes.string,
  updateUser: PropTypes.func,
  resetUpdateUserStatus: PropTypes.func,
  address: PropTypes.string
};

const mapStateToProps = state => {
  const address = network.selectors.getAddress(state) || '';
  return {
    address,
    updateUserStatus: metadata.selectors.getUpdateUserStatus(state),
    profile: metadata.selectors.getProfile(state, address)
  };
};

export default connect(
  mapStateToProps,
  {
    loadProfile: metadata.actions.load,
    updateUser: metadata.actions.updateUser,
    resetUpdateUserStatus: metadata.actions.resetUpdateUserStatus
  }
)(withRouter(EditLocation));
