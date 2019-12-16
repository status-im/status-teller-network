import React from "react";
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNotch} from "@fortawesome/free-solid-svg-icons";
import {withTranslation} from "react-i18next";

import one from "../../../../images/escrow/01.png";
import two from "../../../../images/escrow/02.png";
import three from "../../../../images/escrow/03.png";
import four from "../../../../images/escrow/04.png";
import five from "../../../../images/escrow/05.png";
import TxHash from "../../../ui/TxHash";

const Mining = ({txHash, number, t}) => {
  let image;
  switch(number) {
    case 1: image = one; break;
    case 2: image = two; break;
    case 3: image = three; break;
    case 4: image = four; break;
    case 5: image = five; break;
    default: image = three;
  }

  return (<div className="text-center p-3">
    <span className="bg-dark text-white p-3 rounded-circle">
      <img src={image} alt="three"/>
    </span>
      <h2 className="mt-4">{t('escrow.waiting.title')}</h2>
      <FontAwesomeIcon icon={faCircleNotch} size="5x" spin/>
      {txHash && <p className="text-muted mb-0 mt-3 text-break">{t('transaction.hash')}: <TxHash value={txHash}/></p>}
    </div>);
};

Mining.propTypes = {
  txHash: PropTypes.string,
  number: PropTypes.number,
  t: PropTypes.func
};

export default withTranslation()(Mining);
