import React from 'react';
import successImage from '../../../../../images/success.png';
import {Button} from 'reactstrap';
import PropTypes from 'prop-types';

const Success = ({onClick}) => (
  <div className="text-center p-5">
    <img src={successImage} alt="Success" width="160" height="160" className="mt-5" />
    <h2 className="mt-5 mb-5">Your offer has been successfully published</h2>
    <p>
        <Button color="primary" onClick={onClick}>Go to profile</Button>
    </p>
</div>
);

Success.propTypes = {
    onClick: PropTypes.func
}

export default Success;
