import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import SellerAssets from '../../components/Seller/SellerAssets';
import Footer from "../../components/Footer";

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
    // TODO Save selected asset;
  };

  render() {
    return (
      <Fragment>
        <SellerAssets selectAsset={this.selectAsset} selectedAsset={this.state.selectedAsset} assets={assets}/>
        {<Footer next={this.props.wizard.next} ready={this.state.selectedAsset !== null}/>}
      </Fragment>
    );
  }
}

SellerStartContainer.propTypes = {
  wizard: PropTypes.object
};


export default SellerStartContainer;
