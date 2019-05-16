import React, {Fragment} from 'react';
import {faStop} from "@fortawesome/free-solid-svg-icons";
import RoundedIcon from "../../../ui/RoundedIcon";

const Dispute = () => (
  <Fragment>
    <RoundedIcon icon={faStop} bgColor="red"/>
    <h2 className="mt-4">Disputed</h2>
    <p>A dispute has been opened for this trade</p>
  </Fragment>
);

export default Dispute;
