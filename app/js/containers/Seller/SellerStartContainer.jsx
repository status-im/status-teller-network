import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import SellerAssets from '../../components/Seller/SellerAssets';
import {connect} from "react-redux";
import seller from "../../features/seller";

// TODO where do we get those?
const assets = ['ETH', 'SNT'];

class SellerStartContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedAsset: props.selectedAsset
    };
    this.validate(props.selectedAsset);
    this.props.footer.onNext(() => {
      this.props.setSelectedAsset(this.state.selectedAsset);
    });
  }

  validate(selectedAsset) {
    if (selectedAsset !== null) {
      this.props.footer.enableNext();
    } else {
      this.props.footer.disableNext();
    }
  }

  selectAsset = (selectedAsset) => {
    this.setState({selectedAsset});
    this.validate();
  };

  render() {
    return (
      <Fragment>
        <SellerAssets selectAsset={this.selectAsset} selectedAsset={this.state.selectedAsset} assets={assets}/>
      </Fragment>
    );
  }
}

SellerStartContainer.propTypes = {
  footer: PropTypes.object,
  setSelectedAsset: PropTypes.func,
  selectedAsset: PropTypes.number
};

const mapStateToProps = state => ({
  selectedAsset: seller.selectors.selectedAsset(state)
});

export default connect(
  mapStateToProps,
  {
    setSelectedAsset: seller.actions.setSelectedAsset
  }
)(SellerStartContainer);
