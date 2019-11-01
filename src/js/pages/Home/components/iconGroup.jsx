import React from 'react';
import {Col} from 'reactstrap';
import PropTypes from "prop-types";

import {withNamespaces} from "react-i18next";

const IconGroup = ({src, title, children, fullSize, className, aos}) => (
  <Col className={'icon-group text-center mt-2 ' + className} xs={12} md={fullSize ? 12 : 6} data-aos={aos}>
    <img alt="icon" src={src}/>
    <h3 className="icon-group-title">{title}</h3>
    <div className="home-details">
      {children}
    </div>
  </Col>
);

IconGroup.propTypes = {
  t: PropTypes.func,
  src: PropTypes.string,
  title: PropTypes.string,
  fullSize: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
  "aos": PropTypes.string
};

export default withNamespaces()(IconGroup);
