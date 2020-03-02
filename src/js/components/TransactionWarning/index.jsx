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
import {GSN, TX, SIGN} from "../../utils/saga";

const TransactionWarning = ({t, showTransactionWarning, setTransactionWarningState, warningType}) => {
  const [neverShowAgain, setNeverShowAgain] = useState(false);
  let message;
  switch (warningType) {
    case TX:
      message = t('transactionWarning.walletWillAsk');
      break;
    case GSN:
      message = t('transactionWarning.walletWillAskGSN');
      break;
    case SIGN:
      message = t('transactionWarning.walletSignature');
      break;
    default:
      message = t('transactionWarning.walletWillAsk');
  }
  return (
    <ModalDialog display={showTransactionWarning} buttonText={t('transactionWarning.signWithWallet')}
                 onClick={() => setTransactionWarningState(true, neverShowAgain)}>
      <RoundedIcon image={lightningIcon} bgColor="blue"/>
      <h3 className="m-3">
        {warningType === SIGN ? t('transactionWarning.walletSignatureTitle') : t('transactionWarning.blockchainInteraction')}
      </h3>
      <p className="text-muted mb-2">{message}</p>
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
  warningType: PropTypes.string,
  setTransactionWarningState: PropTypes.func
};


const mapStateToProps = (state) => ({
  showTransactionWarning: network.selectors.showTransactionWarning(state),
  warningType: network.selectors.warningType(state)
});

export default connect(
  mapStateToProps,
  {
    setTransactionWarningState: network.actions.setTransactionWarningState
  }
)(withRouter(withTranslation()(TransactionWarning)));
