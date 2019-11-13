/*global web3*/
import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import EditContact from '../../../components/EditContact';
import newBuy from "../../../features/newBuy";
import {connect} from "react-redux";
import metadata from "../../../features/metadata";
import DOMPurify from 'dompurify';
import {withNamespaces} from "react-i18next";
import {Alert} from "reactstrap";

class Contact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.username
    };
    this.validate(props.username);
    props.footer.onPageChange(() => {
      props.setContactInfo({username: DOMPurify.sanitize(this.state.username)});
    });
  }

  componentDidMount() {
    if(!this.props.price || !this.props.assetQuantity){
      return this.props.wizard.previous();
    }
    if (this.props.profile && this.props.profile.username) {
      this.props.setContactInfo({username: DOMPurify.sanitize(this.props.profile.username)});
    } else {
      this.validate(this.props.username);
    }
    if (!this.props.isEip1102Enabled) {
      this.props.footer.disableNext();
      this.props.enableEthereum();
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isEip1102Enabled && this.props.isEip1102Enabled) {
      this.validate(this.state.username);
    }
  }

  validate(username) {
    if (this.props.isEip1102Enabled && username) {
      return this.props.footer.enableNext();
    }
    this.props.footer.disableNext();
  }

  changeUsername = (username) => {
    this.validate(username);
    this.setState({username});
  };

  render() {
    return (<Fragment>
      {!this.props.isEip1102Enabled &&  <Alert color="warning">{this.props.t('ethereumEnable.buyContact')}</Alert>}

      <EditContact username={this.state.username} changeUsername={this.changeUsername}/>
    </Fragment>);
  }
}

Contact.propTypes = {
  t: PropTypes.func,
  footer: PropTypes.object,
  wizard: PropTypes.object,
  setContactInfo: PropTypes.func,
  username: PropTypes.string,
  profile: PropTypes.object,
  price: PropTypes.number,
  assetQuantity: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  isEip1102Enabled: PropTypes.bool,
  enableEthereum: PropTypes.func
};

const mapStateToProps = state => {
  return {
    username: newBuy.selectors.username(state),
    profile: metadata.selectors.getProfile(state, web3.eth.defaultAccount),
    price: newBuy.selectors.price(state),
    assetQuantity: newBuy.selectors.assetQuantity(state),
    isEip1102Enabled: metadata.selectors.isEip1102Enabled(state)
  };
};

export default connect(
  mapStateToProps,
  {
    setContactInfo: newBuy.actions.setContactInfo,
    enableEthereum: metadata.actions.enableEthereum
  }
  )(withNamespaces()(Contact));
