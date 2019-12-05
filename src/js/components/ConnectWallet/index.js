import React from "react";
import WalletIcon from "../../../images/wallet.svg";
import RoundedIcon from "../../ui/RoundedIcon";
import PropTypes from 'prop-types';
import { Button } from "reactstrap";

const ConnectWallet = ({ enableEthereum }) => (
  <div className="text-center">
    <RoundedIcon image={WalletIcon} className="mb-3" bgColor="blue" />
    <h2 className="mb-3">Connect your wallet to teller</h2>
    <Button color="primary" onClick={enableEthereum}>
      Connect wallet
    </Button>
  </div>
);

ConnectWallet.propTypes = {
  enableEthereum: PropTypes.func
};

export default ConnectWallet;
