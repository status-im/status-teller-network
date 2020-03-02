import React, {useState} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import network from '../../features/network';
import {withTranslation} from "react-i18next";
import ModalDialog from "../ModalDialog";
import lightningIcon from '../../../images/lightning.svg';
import RoundedIcon from "../../ui/RoundedIcon";
import {FormGroup, Label, Input} from 'reactstrap';

const TransactionWarning = ({t, showTransactionWarning, setTransactionWarningState, isGSNWarning}) => {
  const [neverShowAgain, setNeverShowAgain] = useState(false);
  return (
    <ModalDialog display={showTransactionWarning} buttonText={t('transactionWarning.signWithWallet')}
                 onClick={() => setTransactionWarningState(true, neverShowAgain)}>
      <RoundedIcon image={lightningIcon} bgColor="blue"/>
      <h3 className="m-3">{t('transactionWarning.blockchainInteraction')}</h3>
      <p className="text-muted mb-2">{isGSNWarning ? t('transactionWarning.walletWillAskGSN') : t('transactionWarning.walletWillAsk')}</p>
      <FormGroup check>
        <Label check>
          <Input type="checkbox" onChange={(e) => setNeverShowAgain(e.target.checked)}/>
          {t('general.dontShowAgain')}
        </Label>
      </FormGroup>
    </ModalDialog>
  );
};

TransactionWarning.propTypes = {
  t: PropTypes.func,
  showTransactionWarning: PropTypes.bool,
  isGSNWarning: PropTypes.bool,
  setTransactionWarningState: PropTypes.func
};


const mapStateToProps = (state) => ({
  showTransactionWarning: network.selectors.showTransactionWarning(state),
  isGSNWarning: network.selectors.isGSNWarning(state)
});

export default connect(
  mapStateToProps,
  {
    setTransactionWarningState: network.actions.setTransactionWarningState
  }
)(withRouter(withTranslation()(TransactionWarning)));
