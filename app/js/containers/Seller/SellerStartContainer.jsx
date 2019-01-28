import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import SellerAssets from '../../components/Seller/SellerAssets';

class SellerStartContainer extends Component {
  selectAsset = (_selectedAsset) => {
    // TODO Save selected asset;
    this.props.wizard.setReady(true);
  };

  render() {
    return (
      <Fragment>
        <SellerAssets selectAsset={this.selectAsset}/>
      </Fragment>
    );
  }
}

SellerStartContainer.propTypes = {
  wizard: PropTypes.object
};


export default SellerStartContainer;
