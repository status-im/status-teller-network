import React, {Component} from 'react';
import {ButtonGroup} from 'reactstrap';
import PropTypes from 'prop-types';
import CheckButton from '../ui/CheckButton';
import {TokenImages} from '../../utils/images';

class SellerAssets extends Component {
  selectAsset(selectedAsset) {
    this.props.selectAsset(selectedAsset);
  }

  render() {
    return (
      <React.Fragment>
        <h2>Assets</h2>
        <p>What assets are you going to sell</p>

        <h3>Assets in your Wallet</h3>

        <ButtonGroup vertical className="w-100">
          {this.props.availableAssets.map((asset) => (
            <CheckButton active={this.props.selectedAsset === asset.address}
                         key={`asset-${asset.name}`} size="l"
                         onClick={(_e) => this.selectAsset(asset.address)}>
              <img src={TokenImages[`${asset.symbol}.png`]} alt={asset.name + ' icon'} className="mr-3"/>
              {asset.balance} {asset.symbol}
            </CheckButton>
          ))}
        </ButtonGroup>

        <p className="text-muted">Add assets to your wallet to get the ability to sell it. For each asset, you need to create a separate offer.</p>
        {!this.props.selectedAsset && this.props.selectedAsset !== 0 &&
          <p className="text-muted">Select an asset to move to the next page</p>}
      </React.Fragment>
    );
  }
}

SellerAssets.propTypes = {
  selectAsset: PropTypes.func,
  selectedAsset: PropTypes.string,
  availableAssets: PropTypes.array
};


export default SellerAssets;
