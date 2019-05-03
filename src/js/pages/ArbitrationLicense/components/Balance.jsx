import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {withNamespaces} from 'react-i18next';
import classnames from 'classnames';

import SNTIcon from '../../../../images/tokens/SNT.png';

class YourSNTBalance extends Component {
  render() {
    const t = this.props.t;
    return (
      <Fragment>
        <h3>{t('yourSNTBalance.label')}</h3>
        <p className="border rounded p-3">
          <span className={classnames("h3", "font-weight-normal", {'text-danger': this.props.disabled})}>
            <img src={SNTIcon} alt="SNT icon" className="mr-2"/>
            {this.props.value} SNT
          </span>
        </p>
      </Fragment>
    );
  }
}

YourSNTBalance.propTypes = {
  t: PropTypes.func,
  value: PropTypes.string,
  disabled: PropTypes.bool
};

export default withNamespaces()(YourSNTBalance);
