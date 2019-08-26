/*global web3*/
import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import EditContact from '../../../components/EditContact';
import newBuy from "../../../features/newBuy";
import network from "../../../features/network";
import {connect} from "react-redux";
import metadata from "../../../features/metadata";
import {contactCodeRegExp} from '../../../utils/address';
import DOMPurify from 'dompurify';
import escrow from "../../../features/escrow";

class Contact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.username,
      statusContactCode: props.statusContactCode
    };
    this.validate(props.username, props.statusContactCode);
    props.footer.onNext(() => {
      props.signMessage(this.state.username, this.state.statusContactCode);
      props.setContactInfo({username: DOMPurify.sanitize(this.state.username), statusContactCode: DOMPurify.sanitize(this.state.statusContactCode)});
    });
  }

  componentDidMount() {
    if(!this.props.price || !this.props.assetQuantity){
      return this.props.wizard.previous();
    }
    if (this.props.profile && this.props.profile.username) {
      this.props.setContactInfo({username: DOMPurify.sanitize(this.props.profile.username), statusContactCode: DOMPurify.sanitize(this.props.profile.statusContactCode)});
    } else {
      this.validate(this.props.username, this.props.statusContactCode);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.signing && !this.props.signing && this.props.signature && this.props.username) {
      return this.props.wizard.next();
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
        return this.props.footer.disableNext();
      }
      return this.props.footer.enableNext();
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

  render() {
    return (<EditContact isStatus={this.props.isStatus}
                         statusContactCode={this.state.statusContactCode}
                         username={this.state.username}
                         changeStatusContactCode={this.changeStatusContactCode}
                         changeUsername={this.changeUsername}
                         getContactCode={this.getContactCode}
                         resolveENSName={this.props.resolveENSName}
                         ensError={this.props.ensError}/>);
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
  resolveENSName: PropTypes.func,
  ensError: PropTypes.string,
  signMessage: PropTypes.func,
  createEscrow: PropTypes.func,
  signature: PropTypes.string,
  price: PropTypes.number,
  escrowId: PropTypes.string,
  txHash: PropTypes.string,
  assetQuantity: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  offer: PropTypes.object,
  nonce: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  signing: PropTypes.bool
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
    signature: metadata.selectors.getSignature(state),
    price: newBuy.selectors.price(state),
    offer: metadata.selectors.getOfferById(state, offerId),
    nonce: metadata.selectors.getNonce(state),
    signing: metadata.selectors.isSigning(state),
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
    signMessage: metadata.actions.signMessage
  }
  )(withRouter(Contact));
