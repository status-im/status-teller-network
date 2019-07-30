import React from 'react';
import {Button} from 'reactstrap';
import {Link} from "react-router-dom";

const NoArbitratorLicense = () => (
<div className="no-arbitrator-license">
    <h3>You don&apos;t have an arbitrator license </h3>
    <p className="text-muted">Once you are approved as an arbitrator you can make tokens by judging disputes.</p>
    <p className="mt-5 pt-5 text-center">
    <Button color="primary" tag={Link} to="/arbitrator/license" className="mt-5">Become an arbitrator</Button>
    </p>
</div>
);

export default NoArbitratorLicense;
