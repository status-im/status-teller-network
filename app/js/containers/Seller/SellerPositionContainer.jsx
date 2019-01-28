import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import SellerPosition from '../../components/Seller/SellerPosition';

class SellerStartContainer extends Component {
  changeLocation = (newPos) => {
    console.log(newPos);
    this.props.wizard.setReady(!!newPos);
  };

  render() {
    return (
      <Fragment>
        <SellerPosition changeLocation={(newPos) => this.changeLocation(newPos)}/>
      </Fragment>
    );
  }
}

SellerStartContainer.propTypes = {
  wizard: PropTypes.object
};


export default SellerStartContainer;
