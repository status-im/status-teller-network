import React, {Component} from 'react';
import {ButtonGroup, Button} from 'reactstrap';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck} from "@fortawesome/free-solid-svg-icons";

const assets = ['ETH', 'SNT'];

class SellerAssets extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedAsset: null
    };
  }

  selectAsset(selectedAsset) {
    console.log('Select???', selectedAsset);
    console.log(this);
    // FIXME
    this.setState({selectedAsset: selectedAsset});
    this.props.selectAsset(assets[selectedAsset]);
  }

  render() {
    return (
      <React.Fragment>
        <h2>Assets</h2>
        <p>What assets are you going to sell</p>

        <h3>Assets in your Wallet</h3>

        <ButtonGroup vertical className="asset-btns">
          {assets.map((asset, idx) => <Button active={this.state.selectedAsset === idx} color="link"
                                              key={'asset-' + idx} onClick={(_e) => this.selectAsset(idx)}>
            {asset} {this.state.selectedAsset}
            {this.state.selectedAsset === idx && <FontAwesomeIcon icon={faCheck}/>}
          </Button>)}
        </ButtonGroup>

        <p>Add assets to your wallet to get the ability to sell it. For each asset, you need to create a separate offer.</p>
      </React.Fragment>
    );
  }
}

SellerAssets.propTypes = {
  selectAsset: PropTypes.func
};


export default SellerAssets;
