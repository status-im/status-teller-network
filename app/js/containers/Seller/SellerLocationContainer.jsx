import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import SellerPosition from '../../components/Seller/SellerPosition';
import {connect} from "react-redux";
import seller from "../../features/seller";

class SellerLocationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: props.location
    };
    this.validate(props.location);
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
  location: PropTypes.string,
  setLocation: PropTypes.func,
  footer: PropTypes.object
};

const mapStateToProps = state => ({
  location: seller.selectors.location(state)
});

export default connect(
  mapStateToProps,
  {
    setLocation: seller.actions.setLocation
  }
)(SellerLocationContainer);
