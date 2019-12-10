import React from 'react';
import {Button} from 'reactstrap';

import './index.scss';

const LoadingButton = () => (
  <Button color="primary" className="loading-button-spinner">
    <div className="spinner-border text-light" role="status">
      <span className="sr-only">Loading...</span>
    </div>
  </Button>
);

export default LoadingButton;
