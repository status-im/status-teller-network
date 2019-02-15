import React, {Component} from 'react';
import PropTypes from 'prop-types';
import SNT from 'Embark/contracts/SNT';
import {connect} from "react-redux";

import newSeller from "../../features/newSeller";
import SellerAssets from '../../components/Seller/SellerAssets';
import ETH from "../../../images/ethereum.png";
import SNTIcon from "../../../images/status.png";

const availableAssets = [
  {name: 'ETH', icon: ETH, address: '0x0000000000000000000000000000000000000000'},
  {name: 'SNT', icon: SNTIcon, address: SNT.address}
];

class SellerAssetContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedAsset: props.seller.asset
    };
    this.validate(props.seller.asset);
    this.props.footer.onPageChange(() => {
      this.props.setAsset(this.state.selectedAsset);
    });
  }

  validate(asset) {
    if (asset) {
      this.props.footer.enableNext();
    } else {
      this.props.footer.disableNext();
    }
  }

  selectAsset = (selectedAsset) => {
    this.setState({selectedAsset});
    this.validate(selectedAsset);
  };

  render() {
    return (<SellerAssets selectAsset={this.selectAsset} selectedAsset={this.state.selectedAsset} availableAssets={availableAssets}/>);
  }
}

SellerAssetContainer.propTypes = {
  footer: PropTypes.object,
  setAsset: PropTypes.func,
  seller: PropTypes.object
};

const mapStateToProps = state => ({
  seller: newSeller.selectors.getNewSeller(state)
});

export default connect(
  mapStateToProps,
  {
    setAsset: newSeller.actions.setAsset
  }
)(SellerAssetContainer);
