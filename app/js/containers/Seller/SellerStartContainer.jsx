import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import SellerAssets from '../../components/Seller/SellerAssets';

const assets = ['ETH', 'SNT'];

class SellerStartContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedAsset: null
    };
  }

  selectAsset = (selectedAsset) => {
    this.setState({selectedAsset});
    if (selectedAsset !== null) {
      this.props.footer.enableNext();
      // TODO Save selected asset;
    } else {
      this.props.footer.disableNext();
    }
  };

  render() {
    return (
      <Fragment>
        <SellerAssets selectAsset={this.selectAsset} selectedAsset={this.state.selectedAsset} assets={assets}/>
      </Fragment>
    );
  }
}

SellerStartContainer.propTypes = {
  wizard: PropTypes.object,
  footer: PropTypes.object
};


export default SellerStartContainer;
