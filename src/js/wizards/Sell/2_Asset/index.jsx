import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {connect} from "react-redux";

import network from "../../../features/network";
import newSeller from "../../../features/newSeller";
import SellerAssets from './components/SellerAssets';

class Asset extends Component {
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

  componentDidMount() {
    if (!this.props.seller.username) {
      return this.props.wizard.previous();
    }
    this.props.updateBalances();
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
    return (<SellerAssets selectAsset={this.selectAsset} selectedAsset={this.state.selectedAsset} availableAssets={this.props.tokens}/>);
  }
}

Asset.propTypes = {
  footer: PropTypes.object,
  wizard: PropTypes.object,
  setAsset: PropTypes.func,
  updateBalances: PropTypes.func,
  seller: PropTypes.object,
  tokens: PropTypes.array
};

const mapStateToProps = state => ({
  seller: newSeller.selectors.getNewSeller(state),
  tokens: network.selectors.getTokensWithPositiveBalance(state)
});

export default connect(
  mapStateToProps,
  {
    setAsset: newSeller.actions.setAsset,
    updateBalances: network.actions.updateBalances
  }
)(Asset);
