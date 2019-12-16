import React from 'react';
import {Col} from 'reactstrap';
import PropTypes from "prop-types";

import {withTranslation} from "react-i18next";

const IconGroup = ({src, title, children, fullSize, className, aos}) => (
  <Col className={'icon-group text-center mt-5 ' + className} xs={12} md={fullSize ? 12 : 6}>
    <img alt="icon" src={src} data-aos={aos}/>
    <h3 className="icon-group-title" data-aos={aos}>{title}</h3>
    <div className="home-details" data-aos={aos}>
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
  aos: PropTypes.string
};

export default withTranslation()(IconGroup);
