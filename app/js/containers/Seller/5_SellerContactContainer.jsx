import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";

import ContactForm from '../../components/ContactForm';
import Loading from '../../components/ui/Loading';
import ErrorInformation from '../../components/ui/ErrorInformation';
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
    props.footer.onNext(this.postOffer);
  }

  postOffer = () => {
    this.props.addOffer({...this.props.seller, username: this.state.username, statusContactCode: this.state.statusContactCode});
  }

  componentDidMount() {
    if (!this.props.seller.margin || this.props.seller.margin === 0) {
      this.props.wizard.previous();
    } else {
      this.setState({ready: true});
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.addOfferStatus === States.success) {
      this.props.history.push('/profile');
      this.props.resetAddOfferStatus();
    }

    if (prevProps.statusContactCode !== this.props.statusContactCode) {
      this.changeStatusContactCode(this.props.statusContactCode);
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

    switch(this.props.addOfferStatus){
      case States.pending:
        return <Loading mining/>;
      case States.failed:
        return <ErrorInformation transaction retry={this.postOffer}/>;
      case States.none:
        return (
          <ContactForm isStatus={this.props.isStatus}
                       statusContactCode={this.state.statusContactCode} 
                       username={this.state.username}
                       changeStatusContactCode={this.changeStatusContactCode}
                       getContactCode={this.props.getContactCode}
                       changeUsername={this.changeUsername}/>
        );
      default:
        return <React.Fragment></React.Fragment>;
    }
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
  isStatus: PropTypes.bool,
  getContactCode: PropTypes.func,
  statusContactCode: PropTypes.string
};

const mapStateToProps = state => ({
  seller: newSeller.selectors.getNewSeller(state),
  addOfferStatus: metadata.selectors.getAddOfferStatus(state),
  isStatus: network.selectors.isStatus(state),
  statusContactCode: network.selectors.getStatusContactCode(state)
});

export default connect(
  mapStateToProps,
  {
    setContactInfo: newSeller.actions.setContactInfo,
    addOffer: metadata.actions.addOffer,
    resetAddOfferStatus: metadata.actions.resetAddOfferStatus,
    getContactCode: network.actions.getContactCode
  }
)(withRouter(SellerContactContainer));
