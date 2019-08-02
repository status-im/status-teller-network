import React, {Component, Fragment} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import newBuy from "../../../features/newBuy";
import network from "../../../features/network";
import {connect} from "react-redux";
import metadata from "../../../features/metadata";
import {States} from "../../../utils/transaction";
import Loading from "../../../components/Loading";
import ErrorInformation from "../../../components/ErrorInformation";
import escrow from "../../../features/escrow";

class ConfirmTrade extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ready: false
    };
    props.footer.enableNext();
    props.footer.onPageChange(() => {
      this.postEscrow();
      props.footer.hide();
    });
  }

  componentDidMount() {
    if (!this.props.price || !this.props.assetQuantity || !this.props.signature) {
      return this.props.wizard.previous();
    }
    this.setState({ready: true});
  }

  postEscrow = () => {
    this.props.createEscrow(this.props.signature, this.props.username, this.props.assetQuantity, this.props.price, this.props.statusContactCode, this.props.offer, this.props.nonce);
  };

  cancelTrade = () => {
    return this.props.history.push('/buy');
  };

  componentDidUpdate() {
    if (this.props.createEscrowStatus === States.success && !isNaN(this.props.escrowId)) {
      this.props.resetCreateStatus();
      this.props.resetNewBuy();
      return this.props.history.push('/escrow/' + this.props.escrowId);
    }
  }

  componentWillUnmount() {
    if (this.props.createEscrowStatus === States.failed) {
      this.props.resetCreateStatus();
    }
  }

  render() {
    if (!this.state.ready) {
      return <Loading page/>;
    }
    switch (this.props.createEscrowStatus) {
      case States.pending:
        return <Loading mining txHash={this.props.txHash}/>;
      case States.failed:
        return <ErrorInformation transaction retry={this.postEscrow} cancel={this.cancelTrade}/>;
      case States.none:
        return (<Fragment>
          <h2>Confirm trade</h2>
          <p>Token quantity: {this.props.assetQuantity}</p>
          <p>Price: {this.props.price}</p>
        </Fragment>);
      default:
        return <Fragment/>;
    }
  }
}

ConfirmTrade.propTypes = {
  history: PropTypes.object,
  wizard: PropTypes.object,
  footer: PropTypes.object,
  username: PropTypes.string,
  statusContactCode: PropTypes.string,
  resetCreateStatus: PropTypes.func,
  resetNewBuy: PropTypes.func,
  createEscrow: PropTypes.func,
  createEscrowStatus: PropTypes.string,
  signature: PropTypes.string,
  price: PropTypes.number,
  escrowId: PropTypes.string,
  txHash: PropTypes.string,
  assetQuantity: PropTypes.string,
  offer: PropTypes.object,
  nonce: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ])
};

const mapStateToProps = state => {
  const offerId = newBuy.selectors.offerId(state);

  return {
    txHash: escrow.selectors.txHash(state),
    escrowId: escrow.selectors.getCreateEscrowId(state),
    statusContactCode: newBuy.selectors.statusContactCode(state),
    username: newBuy.selectors.username(state),
    ensError: network.selectors.getENSError(state),
    createEscrowStatus: escrow.selectors.getCreateEscrowStatus(state),
    signature: metadata.selectors.getSignature(state),
    price: newBuy.selectors.price(state),
    offer: metadata.selectors.getOfferById(state, offerId),
    nonce: metadata.selectors.getNonce(state),
    assetQuantity: newBuy.selectors.assetQuantity(state),
    offerId
  };
};

export default connect(
  mapStateToProps,
  {
    createEscrow: escrow.actions.createEscrow,
    resetCreateStatus: escrow.actions.resetCreateStatus,
    resetNewBuy: newBuy.actions.resetNewBuy
  }
)(withRouter(ConfirmTrade));
