import React from 'react';
import {Button} from 'reactstrap';
import {Link} from "react-router-dom";
import PropTypes from 'prop-types';
import './index.scss';

const NoLicense = ({arbitratorPage}) => (
<div className="no-license">
    {arbitratorPage && <h3>You don&apos;t have an arbitrator license </h3>}
    {!arbitratorPage && <h3>You don&apos;t have a seller license </h3>}
    {arbitratorPage && <p className="text-muted">Once you are approved as an arbitrator you can make tokens by judging disputes.</p> }
    {!arbitratorPage && <p className="text-muted">Once you are a seller you will be able to create offers</p> }
    <p className="mt-5 pt-5 text-center">
        {arbitratorPage && <Button color="primary" tag={Link} to="/arbitrator/license" className="mt-5">Become an arbitrator</Button> }
        {!arbitratorPage && <Button color="primary" tag={Link} to="/license" className="mt-5">Become a seller</Button> }
    </p>
</div>
);

NoLicense.defaultProps = {
    arbitratorPage: false
};

NoLicense.propTypes = {
    arbitratorPage: PropTypes.bool
  };
  

export default NoLicense;
