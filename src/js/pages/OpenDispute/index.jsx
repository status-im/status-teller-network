import React, {Component} from 'react';
import {Button, ButtonGroup} from 'reactstrap';
import Loading from '../../components/Loading';
import ConfirmDialog from '../../components/ConfirmDialog';
import PropTypes from 'prop-types';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import arbitration from '../../features/arbitration';
import network from '../../features/network';
import CheckButton from '../../ui/CheckButton';

import successImage from '../../../images/success.png';
import {ARBITRATION_UNSOLVED, UNRESPONSIVE, PAYMENT, OTHER} from "../../features/arbitration/constants";
import { addressCompare } from '../../utils/address';
import {withTranslation} from "react-i18next";

class OpenDispute extends Component {
  state = {
    motive: '',
    displayDialog: false
  };

  constructor(props){
    super(props);
    props.loadArbitration(props.escrowId);
  }

  componentDidUpdate() {
    if (this.props.escrow.arbitration) {
      if(this.props.escrow.arbitration.open || this.props.escrow.arbitration.result !== ARBITRATION_UNSOLVED){
        this.props.history.push('/');
      }
    }
  }

  setMotive = motive => () => {
    this.setState({motive});
  };

  displayDialog = show => () => {
    this.setState({displayDialog: show});
  };

  goToProfile = () => {
    this.props.history.push('/profile');
  };

  handleClickDialog = escrowId => () => {
    this.props.openDispute(escrowId, this.state.motive);
  };

  render(){
    const {t, escrow, loading, receipt, address} = this.props;

    if(!escrow) return <Loading page />;
    if(loading) return <Loading mining />;

    const isBuyer = addressCompare(escrow.buyer, address);

    if(receipt) return (
      <div className="text-center p-5">
        <img src={successImage} alt="Success" width="160" height="160" className="mt-5" />
        <h2 className="mt-5">{t('escrow.openDispute.success')}</h2>
        <p className="text-muted">{t('escrow.openDispute.followProgress')}</p>
        <p>
          <Button color="primary" onClick={this.goToProfile}>Okay</Button>
        </p>
    </div>
    );

    return (
      <div className="openDispute">
        <h2>{t('escrow.openDispute.open')}</h2>
        <p>{t('escrow.openDispute.describeDetails')}</p>
        <ButtonGroup vertical className="w-100">
          <CheckButton size="l" active={this.state.motive === UNRESPONSIVE} onClick={this.setMotive(UNRESPONSIVE)}>
          <span className="font-weight-bold">{t('escrow.openDispute.unresponsive')}</span>
          { isBuyer && <p className="text-muted text-small">{t('escrow.openDispute.sellerUnresponsive')}</p>}
          { !isBuyer && <p className="text-muted text-small">{t('escrow.openDispute.buyerUnresponsive')}</p>}
          </CheckButton>
          <CheckButton size="l" active={this.state.motive === PAYMENT} onClick={this.setMotive(PAYMENT)}>
          <span className="font-weight-bold">{t('escrow.openDispute.paymentIssue')}</span>
          { isBuyer && <p className="text-muted text-small">{t('escrow.openDispute.sellerPayment')}</p> }
          { !isBuyer && <p className="text-muted text-small">{t('escrow.openDispute.buyerPayment')}</p>}
          </CheckButton>
          <CheckButton size="l" active={this.state.motive === OTHER} onClick={this.setMotive(OTHER)}>
          <span className="font-weight-bold">{t('escrow.openDispute.other')}</span>
          <p className="text-muted text-small">{t('escrow.openDispute.otherReason')}</p>
          </CheckButton>
        </ButtonGroup>
        <p className="text-muted">{t('escrow.openDispute.durationProcess')}</p>
        <p className="text-center">
          <Button color="primary" disabled={!this.state.motive} onClick={this.displayDialog(true)}>
            {t('general.send')}
          </Button>
        </p>
        <ConfirmDialog display={this.state.displayDialog} onConfirm={this.handleClickDialog(escrow.escrowId)}
                       onCancel={this.displayDialog(false)}
                       title={t('escrow.openDispute.open')} content={t('general.youSure')}
                       cancelText={t('general.no')}/>
      </div>
    );
  }
}

OpenDispute.propTypes = {
  t: PropTypes.func,
  address: PropTypes.string,
  history: PropTypes.object,
  escrow: PropTypes.object,
  escrowId: PropTypes.string,
  loadArbitration: PropTypes.func,
  openDispute: PropTypes.func,
  loading: PropTypes.bool,
  receipt: PropTypes.object
};


const mapStateToProps = (state, props) => {
  return {
    address: network.selectors.getAddress(state) || "",
    escrowId:  props.match.params.id.toString(),
    escrow: arbitration.selectors.getArbitration(state),
    loading: arbitration.selectors.loading(state),
    receipt: arbitration.selectors.receipt(state)
  };
};

export default connect(
  mapStateToProps,
  {
    loadArbitration: arbitration.actions.loadArbitration,
    openDispute: arbitration.actions.openDispute
  }
)(withRouter(withTranslation()(OpenDispute)));

