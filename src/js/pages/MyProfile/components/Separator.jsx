import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const Separator = ({className}) => (
    <div className={classnames("clearfix separator-container", {[className]: className})}>
        <span className="separator"/>
    </div>
);

Separator.propTypes = {
  className: PropTypes.string
};

export default Separator;
