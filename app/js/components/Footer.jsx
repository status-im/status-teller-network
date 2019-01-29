import React from 'react';
import PropTypes from 'prop-types';
import {Button} from 'reactstrap';

import './footer.scss';

const Footer = (props) => (
  <footer className="container">
    {props.previous && <Button onClick={props.previous} className="m-2" color="link">&lt; Previous</Button>}
    {props.next && <Button onClick={props.next} className="float-right m-2" color="link" disabled={!props.ready}>Next &gt;</Button>}
  </footer>
);

Footer.propTypes = {
  previous: PropTypes.func,
  next: PropTypes.func,
  ready: PropTypes.bool
};

export default Footer;
