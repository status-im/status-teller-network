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
import Success from './components/Success';
import "./index.scss";

class Limits extends Component {
  constructor(props) {
    super(props);
    this.state = {
      limitL: props.seller.limitL,
      limitU: props.seller.limitU,
      useCustomLimits: props.seller.useCustomLimits,
      ready: false
    };
    this.validate(props.seller.useCustomLimits, props.seller.limitL, props.seller.limitU);
  }

  componentDidMount() {
    if (isNaN(this.props.seller.margin)) {
      return this.props.wizard.previous();
    }
    this.setState({ready: true});
    this.offerCreated = false;
    this.props.footer.onNext(this.postOffer);
  }

  postOffer = () => {
    this.props.footer.hide();
    this.props.addOffer({...this.props.seller, useCustomLimits: this.state.useCustomLimits, limitL: this.state.limitL || 0, limitU: this.state.limitU || 0});
  };

  componentDidUpdate() {
    if (this.props.addOfferStatus === States.success && !this.offerCreated) {
      this.offerCreated = true;
      this.props.footer.hide();
    } else {
      this.offerCreated = false;
    }
  }

  continue = () => {
    this.props.resetAddOfferStatus();
    this.props.history.push('/profile');
  };

  cancel = () => {
    this.props.resetAddOfferStatus();
    this.props.footer.onNext(this.postOffer);
    this.props.footer.show();
  };

  validate(useCustomLimits, limitL, limitU) {
    limitL = limitL || 0;
    limitU = limitU || 0;

    if (useCustomLimits) {
      if ((limitL > limitU) || (limitL === 0 && limitU === 0)) {
        return this.props.footer.disableNext();
      }
    }
    this.props.footer.enableNext();
  }

  customLimitsChange = (useCustomLimits) => {
    this.setState({useCustomLimits}, () => {
      this.validate(useCustomLimits, this.state.limitL, this.state.limitU);
    });
  };

  limitChange = (limitL, limitU) => {
    limitL = parseInt(limitL, 10);
    if (isNaN(limitL)) {
      limitL = '';
    }
    limitU = parseInt(limitU, 10);
    if (isNaN(limitU)) {
      limitU = '';
    }
    this.validate(this.state.useCustomLimits, limitL, limitU);
    this.setState({limitL, limitU});
  };

  render() {
    if (!this.state.ready) {
      return <Loading page/>;
    }
    switch(this.props.addOfferStatus){
      case States.pending:
        return <Loading mining txHash={this.props.txHash}/>;
      case States.failed:
        return <ErrorInformation transaction retry={this.postOffer} cancel={this.cancel}/>;
      case States.none:
        return <LimitForm limitL={this.state.limitL}
                          limitU={this.state.limitU}
                          currency={this.props.seller.currency}
                          useCustomLimits={this.state.useCustomLimits}
                          customLimitsChange={this.customLimitsChange}
                          limitChange={this.limitChange} />;
      case States.success:
        return <Success onClick={this.continue} />;
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
