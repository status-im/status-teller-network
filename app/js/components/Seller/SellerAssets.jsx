import React, {Component} from 'react';
import {ButtonGroup, Button} from 'reactstrap';

class SellerAssets extends Component {
  render() {
    return (
      <React.Fragment>
        <h2>Assets</h2>
        <p>What assets are you going to sell</p>

        <h3>Assets in your Wallet</h3>

        <ButtonGroup vertical>
          <Button>ETH</Button>
          <Button>SNT</Button>
        </ButtonGroup>

        <p>Add assets to your wallet to get the ability to sell it. For each asset, you need to create a separate offer.</p>
      </React.Fragment>
    );
  }
}

SellerAssets.propTypes = {};


export default SellerAssets;
