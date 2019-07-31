import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import LimitForm from './components/LimitForm';
import Loading from '../../../components/Loading';
import newSeller from "../../../features/newSeller";
import metadata from "../../../features/metadata";
import {States} from "../../../utils/transaction";
import ErrorInformation from '../../../components/ErrorInformation';
import {withRouter} from "react-router-dom";

import "./index.scss";

class Limits extends Component {
  constructor(props) {
    super(props);
    this.state = {
      limitL: props.seller.limitL,
      limitU: props.seller.limitU,
      useCustomLimits: props.seller.useCustomLimits
    };
    this.validate(props.seller.useCustomLimits, props.seller.limitL, props.seller.limitU);

    props.footer.onPageChange(() => {
      props.setLimits(this.state.useCustomLimits, this.state.limitL, this.state.limitU);
    });
    props.footer.onNext(this.postOffer);
  }

  postOffer = () => {
    this.props.footer.hide();
    this.props.addOffer({...this.props.seller, useCustomLimits: this.state.useCustomLimits, limitL: this.state.limitL, limitU: this.state.limitU});
  };

  componentDidUpdate() {
    if (this.props.addOfferStatus === States.success) {
      this.props.history.push('/profile');
      this.props.resetAddOfferStatus();
    }
  }

  validate(useCustomLimits, limitL, limitU) {
    this.props.footer.enableNext(); 

    if(useCustomLimits){
      if(limitL > limitU){
        return this.props.footer.disableNext();
      }
    }
  }

  customLimitsChange = (useCustomLimits) => {
    this.validate(useCustomLimits, this.state.limitL, this.state.limitU);
    this.setState({useCustomLimits});
  }

  limitChange = (limitL, limitU) => {
    limitL = parseInt(limitL, 10);
    if (isNaN(limitL)) {
      limitL = '';
    }
    limitU = parseInt(limitU, 10);
    if (isNaN(limitU)) {
      limitU = '';
    }
    this.validate(limitL, limitU);
    this.setState({limitL, limitU});
  };

  render() {
    switch(this.props.addOfferStatus){
      case States.pending:
        return <Loading mining txHash={this.props.txHash}/>;
      case States.failed:
        return <ErrorInformation transaction retry={this.postOffer} cancel={this.props.resetAddOfferStatus}/>;
      case States.none:
        return <LimitForm limitL={this.state.limitL}
                          limitU={this.state.limitU}
                          currency={this.props.seller.currency}
                          useCustomLimits={this.state.useCustomLimits}
                          customLimitsChange={this.customLimitsChange}
                          limitChange={this.limitChange} />;
      default:
        return <Fragment/>;
    }
  }
}

Limits.propTypes = {
  t: PropTypes.func,
  history: PropTypes.object,
  addOffer: PropTypes.func,
  setLimits: PropTypes.func,
  seller: PropTypes.object,
  token: PropTypes.object,
  addOfferStatus: PropTypes.string,
  resetAddOfferStatus: PropTypes.func,
  wizard: PropTypes.object,
  footer: PropTypes.object,
  txHash: PropTypes.string
};

const mapStateToProps = state => ({
  seller: newSeller.selectors.getNewSeller(state),
  addOfferStatus: metadata.selectors.getAddOfferStatus(state),
  txHash: metadata.selectors.getAddOfferTx(state)
});

export default connect(
  mapStateToProps,
  {
    setLimits: newSeller.actions.setLimits,
    addOffer: metadata.actions.addOffer,
    resetAddOfferStatus: metadata.actions.resetAddOfferStatus
  }
)(withRouter(Limits));
