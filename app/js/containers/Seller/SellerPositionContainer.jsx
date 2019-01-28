import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import SellerAssets from '../../components/Seller/SellerAssets';

class SellerStartContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedAsset: null
    };
  }

  selectAsset = (selectedAsset) => {
    this.setState({selectedAsset});
  };

  goNext = () => {
    // Save selected asset
    console.log('Selected', this.state.selectedAsset);
    this.props.wizard.next();
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
