import React from 'react';
import ModalDialog from '../ModalDialog';
import RoundedIcon from "../../ui/RoundedIcon";
import errorIcon from "../../../images/exclamation-circle.png";
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import metadata from "../../features/metadata";
import {withTranslation} from "react-i18next";

const NoWeb3Dialog = ({t, usingDefaultProvider, resetProviderVerification}) => (
  <ModalDialog display={usingDefaultProvider}
                onClose={resetProviderVerification}
                hideButton>
    <RoundedIcon image={errorIcon} className="mb-2" bgColor="red" />
      <h2>{t('noWeb3Dialog.title')}</h2>
      <p className="text-muted">{t('noWeb3Dialog.subtitle')}</p>
      <p className="text-muted text-small mb-0 text-left">
      {t('noWeb3Dialog.mobileBrowsers')}
      </p>
      <p className="text-left">
        <a href="https://status.im" target="_blank" rel="noopener noreferrer">Status</a>, <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">Metamask</a>, <a href="https://trustwallet.com" target="_blank" rel="noopener noreferrer">Trust Wallet</a> or <a href="https://wallet.coinbase.com" target="_blank" rel="noopener noreferrer">Coinbase Wallet</a> 
      </p>
      <p className="text-muted text-small mb-0 text-left">
      {t('noWeb3Dialog.desktopBrowsers')}
      </p>
      <p className="text-left">
        <a href="https://metamask.io" target="_blank" rel="noopener noreferrer">Metamask</a>, <a href="https://brave.com" target="_blank" rel="noopener noreferrer">Brave</a> or <a href="https://opera.com" target="_blank" rel="noopener noreferrer">Opera</a>
      </p>
  </ModalDialog>
);

NoWeb3Dialog.propTypes = {
  usingDefaultProvider: PropTypes.bool,
  resetProviderVerification: PropTypes.func,
  t: PropTypes.func
};

const mapStateToProps = state => ({
  usingDefaultProvider: metadata.selectors.usingDefaultProvider(state)
});

export default connect(
  mapStateToProps,
  {
    resetProviderVerification: metadata.actions.resetProviderVerification
  }
)(withTranslation()(NoWeb3Dialog));

