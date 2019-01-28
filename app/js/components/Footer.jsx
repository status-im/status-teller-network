import React from 'react';
import PropTypes from 'prop-types';
import {Button} from 'reactstrap';

const Footer = (props) => (
  <footer>
    {props.previous && <Button onClick={props.previous} className="previous-btn" color="link">&lt; Previous</Button>}
    {props.next && <Button onClick={props.next} className="next-btn" color="link" disabled={!props.ready}>Next &gt;</Button>}
  </footer>
);

Footer.propTypes = {
  previous: PropTypes.func,
  next: PropTypes.func,
  ready: PropTypes.bool
};

export default Footer;
