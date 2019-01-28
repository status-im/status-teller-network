import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import SellerAssets from '../../components/Seller/SellerAssets';
import Footer from "../../components/Footer";

class SellerStartContainer extends Component {
  render() {
    return (
      <Fragment>
        <SellerAssets/>
        <Footer next={this.props.wizard.next}/>
      </Fragment>
    );
  }
}

SellerStartContainer.propTypes = {
  wizard: PropTypes.object
};


export default SellerStartContainer;
