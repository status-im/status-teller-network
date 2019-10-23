import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';

import {connect} from "react-redux";

import network from "../../../features/network";
import newSeller from "../../../features/newSeller";
import SellerAssets from './components/SellerAssets';
import {Alert} from "reactstrap";
import metadata from "../../../features/metadata";
import {withNamespaces} from "react-i18next";

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
    if (!this.props.isEip1102Enabled) {
      this.props.enableEthereum();
    }
    this.load();
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isEip1102Enabled && this.props.isEip1102Enabled) {
      this.load();
    }
  }

  load() {
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
    return (<Fragment>
      {!this.props.isEip1102Enabled && <Alert color="warning">{this.props.t('ethereumEnable.createOffer')}</Alert>}
      <SellerAssets selectAsset={this.selectAsset} selectedAsset={this.state.selectedAsset}
                    availableAssets={this.props.tokens}/>
    </Fragment>);
  }
}

Asset.propTypes = {
  t: PropTypes.func,
  footer: PropTypes.object,
  wizard: PropTypes.object,
  setAsset: PropTypes.func,
  updateBalances: PropTypes.func,
  seller: PropTypes.object,
  tokens: PropTypes.array,
  isEip1102Enabled: PropTypes.bool,
  enableEthereum: PropTypes.func
};

const mapStateToProps = state => ({
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
)(withNamespaces()(Asset));
