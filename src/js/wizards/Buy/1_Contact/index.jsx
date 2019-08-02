/*global web3*/
import React, {Component,Fragment} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import EditContact from '../../../components/EditContact';
import newBuy from "../../../features/newBuy";
import network from "../../../features/network";
import {connect} from "react-redux";
import metadata from "../../../features/metadata";
import {contactCodeRegExp} from '../../../utils/address';
import DOMPurify from 'dompurify';
import {States} from "../../../utils/transaction";
import Loading from "../../../components/Loading";
import ErrorInformation from "../../../components/ErrorInformation";
import escrow from "../../../features/escrow";

class Contact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.username,
      statusContactCode: props.statusContactCode
    };
    this.validate(props.username, props.statusContactCode);
    props.footer.onPageChange(() => {
      props.signMessage(this.state.username, this.state.statusContactCode);
      props.setContactInfo({username: DOMPurify.sanitize(this.state.username), statusContactCode: DOMPurify.sanitize(this.state.statusContactCode)});
    });
  }

  componentDidMount() {
    if(!this.props.price || !this.props.assetQuantity){
      return this.props.history.push('/buy');
    }
    if (this.props.profile && this.props.profile.username) {
      this.props.setContactInfo({username: DOMPurify.sanitize(this.props.profile.username), statusContactCode: DOMPurify.sanitize(this.props.profile.statusContactCode)});
    } else {
      this.validate(this.props.username, this.props.statusContactCode);
    }

    this.setState({ready: true});
  }

  postEscrow = () => {
    this.props.createEscrow(this.props.signature, this.props.username, this.props.assetQuantity, this.props.price, this.props.statusContactCode, this.props.offer, this.props.nonce);
  };

  cancelTrade = () => {
    return this.props.history.push('/buy');
  };

  componentDidUpdate(prevProps) {
    if (this.props.createEscrowStatus === States.none && this.props.signature && this.props.username) {
      this.postEscrow();
    }

    if (this.props.createEscrowStatus === States.success) {
      this.props.resetCreateStatus();
      this.props.resetNewBuy();
      // TODO change to success page
      return this.props.history.push('/escrow/' + this.props.escrowId);
    }

    if(!prevProps.apiContactCode && this.props.apiContactCode){
      this.changeStatusContactCode(this.props.apiContactCode);
    }

    if (prevProps.statusContactCode !== this.props.statusContactCode && prevProps.username !== this.props.username) {
      this.change(this.props.statusContactCode, this.props.username);
    }
  }

  validate(username, statusContactCode) {
    if (username && statusContactCode) {
      if(!contactCodeRegExp.test(statusContactCode)){
        this.props.footer.disableNext();
      } else {
        return this.props.footer.enableNext();
      }
    }
    this.props.footer.disableNext();
  }

  change = (statusContactCode, username) => {
    this.validate(username, statusContactCode);
    this.setState({statusContactCode, username});
  };

  changeStatusContactCode = (statusContactCode) => {
    this.change(statusContactCode, this.state.username);
  };

  changeUsername = (username) => {
    this.change(this.state.statusContactCode, username);
  };

  getContactCode = () => {
    if(!this.props.apiContactCode){
      this.props.getContactCode();
    } else {
      this.setState({ statusContactCode: this.props.apiContactCode });
    }
  };

  componentWillUnmount() {
    if (this.props.createEscrowStatus === States.failed) {
      this.props.resetCreateStatus();
    }
  }

  render() {
    switch(this.props.createEscrowStatus){
      case States.pending:
        return <Loading mining txHash={this.props.txHash}/>;
      case States.failed:
        return <ErrorInformation transaction retry={this.postEscrow} cancel={this.cancelTrade}/>;
      case States.none:
        return (
          <EditContact isStatus={this.props.isStatus}
                       statusContactCode={this.state.statusContactCode}
                       username={this.state.username}
                       changeStatusContactCode={this.changeStatusContactCode}
                       changeUsername={this.changeUsername}
                       getContactCode={this.getContactCode}
                       resolveENSName={this.props.resolveENSName}
                       ensError={this.props.ensError} />
        );
      default:
        return <Fragment/>;
    }
  }
}

Contact.propTypes = {
  history: PropTypes.object,
  footer: PropTypes.object,
  wizard: PropTypes.object,
  setContactInfo: PropTypes.func,
  username: PropTypes.string,
  statusContactCode: PropTypes.string,
  apiContactCode: PropTypes.string,
  isStatus: PropTypes.bool,
  getContactCode: PropTypes.func,
  profile: PropTypes.object,
  resetCreateStatus: PropTypes.func,
  resetNewBuy: PropTypes.func,
  resolveENSName: PropTypes.func,
  ensError: PropTypes.string,
  signMessage: PropTypes.func,
  createEscrow: PropTypes.func,
  createEscrowStatus: PropTypes.string,
  signature: PropTypes.string,
  price: PropTypes.number,
  escrowId: PropTypes.string,
  txHash: PropTypes.string,
  assetQuantity: PropTypes.string,
  offer: PropTypes.object,
  nonce: PropTypes.string
};

const mapStateToProps = state => {
  const offerId = newBuy.selectors.offerId(state);

  return {
    txHash: escrow.selectors.txHash(state),
    escrowId: escrow.selectors.getCreateEscrowId(state),
    statusContactCode: newBuy.selectors.statusContactCode(state),
    apiContactCode: network.selectors.getStatusContactCode(state),
    username: newBuy.selectors.username(state),
    isStatus: network.selectors.isStatus(state),
    ensError: network.selectors.getENSError(state),
    profile: metadata.selectors.getProfile(state, web3.eth.defaultAccount),
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
    setContactInfo: newBuy.actions.setContactInfo,
    getContactCode: network.actions.getContactCode,
    resolveENSName: network.actions.resolveENSName,
    resetCreateStatus: escrow.actions.resetCreateStatus,
    signMessage: metadata.actions.signMessage,
    resetNewBuy: newBuy.actions.resetNewBuy
  }
  )(withRouter(Contact));
