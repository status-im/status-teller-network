import React, {Component} from 'react';
import {ButtonGroup, Button} from 'reactstrap';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck} from "@fortawesome/free-solid-svg-icons";

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

        <ButtonGroup vertical className="asset-btns">
          {this.props.assets.map((asset, idx) => <Button active={this.props.selectedAsset === idx} color="link"
                                              key={'asset-' + idx} onClick={(_e) => this.selectAsset(idx)}>
            {asset}
            {this.props.selectedAsset === idx && <FontAwesomeIcon icon={faCheck}/>}
          </Button>)}
        </ButtonGroup>

        <p>Add assets to your wallet to get the ability to sell it. For each asset, you need to create a separate offer.</p>
        {!this.props.selectedAsset && this.props.selectedAsset !== 0 &&
          <p className="text-info">Select an asset to move to the next page</p>}
      </React.Fragment>
    );
  }
}

SellerAssets.propTypes = {
  selectAsset: PropTypes.func,
  selectedAsset: PropTypes.number,
  assets: PropTypes.array
};


export default SellerAssets;
