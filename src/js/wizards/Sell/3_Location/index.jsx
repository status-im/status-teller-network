/*global web3*/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import DOMPurify from 'dompurify';

import SellerPosition from './components/SellerPosition';
import newSeller from "../../../features/newSeller";
import metadata from "../../../features/metadata";

class Location extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: props.seller.location
    };
    this.validate(props.seller.location);
    this.props.footer.onPageChange(() => {
      this.props.setLocation(DOMPurify.sanitize(this.state.location));
    });
  }

  componentDidMount() {
    if (!this.props.seller.currency) {
      return this.props.wizard.previous();
    }
  }

  validate(location) {
    if (location && location.trim() !== "") {
      this.props.footer.enableNext();
    } else {
      this.props.footer.disableNext();
    }
  }

  changeLocation = (location) => {
    this.setState({location});
    this.validate(location);
  };

  render() {
    return <SellerPosition changeLocation={this.changeLocation} location={this.state.location}/>;
  }
}

Location.propTypes = {
  wizard: PropTypes.object,
  seller: PropTypes.object,
  setLocation: PropTypes.func,
  footer: PropTypes.object,
  profile: PropTypes.object
};

const mapStateToProps = state => ({
  seller: newSeller.selectors.getNewSeller(state),
  profile: metadata.selectors.getProfile(state, web3.eth.defaultAccount)
});

export default connect(
  mapStateToProps,
  {
    setLocation: newSeller.actions.setLocation
  }
)(Location);
