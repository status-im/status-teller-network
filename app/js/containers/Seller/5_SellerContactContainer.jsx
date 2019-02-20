import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";

import ContactForm from '../../components/ContactForm';
import Loading from '../../components/ui/Loading';
import newSeller from "../../features/newSeller";
import metadata from "../../features/metadata";
import { States } from '../../utils/transaction';
import network from '../../features/network';

class SellerContactContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.seller.username,
      statusContactCode: props.seller.statusContactCode,
      ready: false
    };
    this.validate(props.seller.username, props.seller.statusContactCode);
    props.footer.onPageChange(() => {
      props.setContactInfo({username: this.state.username, statusContactCode: this.state.statusContactCode});
    });
    props.footer.onNext(() => {
      props.addOffer({...this.props.seller, username: this.state.username, statusContactCode: this.state.statusContactCode});
    });
  }

  componentDidMount() {
    if (!this.props.seller.margin || this.props.seller.margin === 0) {
      this.props.wizard.previous();
    } else {
      this.setState({ready: true});
    }
  }

  componentDidUpdate() {
    if (this.props.addOfferStatus === States.success) {
      this.props.history.push('/profile');
      this.props.resetAddOfferStatus();
    }
  }

  validate(username, statusContactCode) {
    if (username && statusContactCode) {
      return this.props.footer.enableNext();
    }
    this.props.footer.disableNext();
  }

  changeStatusContactCode = (statusContactCode) => {
    this.validate(this.state.username, statusContactCode);
    this.setState({statusContactCode});
  };

  changeUsername = (username) => {
    this.validate(username, this.state.statusContactCode);
    this.setState({username});
  };

  render() {
    if (!this.state.ready) {
      return <Loading page/>;
    }

    if (this.props.addOfferStatus === States.pending) {
      return <Loading mining/>;
    }
    
    if (this.props.addOfferStatus === States.none) {
      return (
        <ContactForm isStatus={this.props.isStatus}
                     statusContactCode={this.state.statusContactCode} 
                     username={this.state.username}
                     changeStatusContactCode={this.changeStatusContactCode}
                     changeUsername={this.changeUsername}/>
      );
    }

    return <React.Fragment></React.Fragment>;
    
  }
}

SellerContactContainer.propTypes = {
  history: PropTypes.object,
  footer: PropTypes.object,
  wizard: PropTypes.object,
  setContactInfo: PropTypes.func,
  seller: PropTypes.object,
  addOffer: PropTypes.func,
  resetAddOfferStatus: PropTypes.func,
  addOfferStatus: PropTypes.string,
  isStatus: PropTypes.bool
};

const mapStateToProps = state => ({
  seller: newSeller.selectors.getNewSeller(state),
  addOfferStatus: metadata.selectors.getAddOfferStatus(state),
  isStatus: network.selectors.isStatus(state)
});

export default connect(
  mapStateToProps,
  {
    setContactInfo: newSeller.actions.setContactInfo,
    addOffer: metadata.actions.addOffer,
    resetAddOfferStatus: metadata.actions.resetAddOfferStatus
  }
)(withRouter(SellerContactContainer));
