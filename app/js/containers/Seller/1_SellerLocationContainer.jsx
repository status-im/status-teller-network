import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";

import SellerPosition from '../../components/Seller/SellerPosition';
import newSeller from "../../features/newSeller";

class SellerLocationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: props.seller.location
    };
    this.validate();
    this.props.footer.onPageChange(() => {
      this.props.setLocation(this.state.location);
    });
  }

  validate(location) {
    if (location) {
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
    return (
      <Fragment>
        <SellerPosition changeLocation={this.changeLocation} location={this.state.location}/>
      </Fragment>
    );
  }
}

SellerLocationContainer.propTypes = {
  seller: PropTypes.object,
  setLocation: PropTypes.func,
  footer: PropTypes.object
};

const mapStateToProps = state => ({
  seller: newSeller.selectors.getNewSeller(state)
});

export default connect(
  mapStateToProps,
  {
    setLocation: newSeller.actions.setLocation
  }
)(SellerLocationContainer);
