import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {connect} from "react-redux";

import network from "../../../features/network";
import newSeller from "../../../features/newSeller";
import SellerAssets from './components/SellerAssets';
import metadata from "../../../features/metadata";

class Asset extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedAsset: props.seller.asset
    };
    this.validate(props.seller.asset);

    this.props.footer.hide();

    this.props.footer.onPageChange(() => {
      this.props.setAsset(this.state.selectedAsset);
    });
  }

  componentDidMount() {
    if (this.props.isEip1102Enabled) {
      this.load();
      this.props.footer.show();
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isEip1102Enabled && this.props.isEip1102Enabled) {
      this.load();
      this.props.footer.show();
    } else if (prevProps.isEip1102Enabled && !this.props.isEip1102Enabled) {
      // Somehow became disabled
      this.props.footer.hide();
    }
  }

  load() {
    this.props.updateBalances(this.props.address);
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
    return (<SellerAssets selectAsset={this.selectAsset}
                          selectedAsset={this.state.selectedAsset}
                          address={this.props.address}
                          availableAssets={this.props.tokens}
                          isEip1102Enabled={this.props.isEip1102Enabled}
                          enableEip1102={() => this.props.enableEthereum()}/>);
  }
}

Asset.propTypes = {
  footer: PropTypes.object,
  wizard: PropTypes.object,
  setAsset: PropTypes.func,
  updateBalances: PropTypes.func,
  seller: PropTypes.object,
  tokens: PropTypes.array,
  isEip1102Enabled: PropTypes.bool,
  address: PropTypes.string,
  enableEthereum: PropTypes.func
};

const mapStateToProps = state => ({
  address: network.selectors.getAddress(state) || '',
  seller: newSeller.selectors.getNewSeller(state),
  tokens: network.selectors.getTokensWithPositiveBalance(state),
  isEip1102Enabled: metadata.selectors.isEip1102Enabled(state)
});

export default connect(
  mapStateToProps,
  {
    setAsset: newSeller.actions.setAsset,
    updateBalances: network.actions.updateBalances,
    enableEthereum: metadata.actions.enableEthereum
  }
)(Asset);
