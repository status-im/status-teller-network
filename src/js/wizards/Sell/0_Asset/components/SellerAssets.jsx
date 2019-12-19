import React, {Component, Fragment} from 'react';
import {ButtonGroup, Button} from 'reactstrap';
import PropTypes from 'prop-types';
import CheckButton from '../../../../ui/CheckButton';
import {getTokenImage} from '../../../../utils/images';
import {formatBalance} from '../../../../utils/numbers';
import {addressCompare} from '../../../../utils/address';
import noCryptoImg from "../../../../../images/no-crypto.png";
import {withTranslation} from "react-i18next";

import './SellerAssets.scss';

class SellerAssets extends Component {
  selectAsset(selectedAsset) {
    this.props.selectAsset(selectedAsset);
  }

  render() {
    return (
      <Fragment>
        <h2>{this.props.t('sellerAssets.title')}</h2>

        {(!this.props.isEip1102Enabled || !this.props.address) && <Fragment>
          <p>{this.props.t('ethereumEnable.createOffer')}</p>
          <img src={noCryptoImg} alt="No crypto list" className="d-block mx-auto"/>
          <Button className="d-block mx-auto" onClick={this.props.enableEip1102}>{this.props.t('connectWallet.connect')}</Button>
        </Fragment>}

        {(this.props.isEip1102Enabled && this.props.address) &&
        <Fragment>
          <ButtonGroup vertical className="w-100">
            {!this.props.availableAssets.length &&
            <p className="text-warning">{this.props.t('sellerAssets.noAssets')}</p>}
            {this.props.availableAssets.map((asset) => (
              <CheckButton active={addressCompare(this.props.selectedAsset, asset.address)}
                           key={`asset-${asset.name}`} size="l"
                           onClick={(_e) => this.selectAsset(asset.address)}>
                <img src={getTokenImage(asset.symbol)} alt={asset.name + ' icon'}
                     className="asset-image mr-3 float-left"/>
                <p>{asset.name}</p>
                <p className="text-muted">{formatBalance(asset.balance)} {asset.symbol}</p>
              </CheckButton>
            ))}
          </ButtonGroup>

          <p className="text-muted">{this.props.t('sellerAssets.helpText')}</p>
        </Fragment>}
      </Fragment>
    );
  }
}

SellerAssets.propTypes = {
  t: PropTypes.func,
  address: PropTypes.string,
  selectAsset: PropTypes.func,
  selectedAsset: PropTypes.string,
  availableAssets: PropTypes.array,
  isEip1102Enabled: PropTypes.bool,
  enableEip1102: PropTypes.func
};


export default withTranslation()(SellerAssets);
