import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from 'react-i18next';
import classnames from 'classnames';

import SNTIcon from '../../../../../node_modules/cryptocurrency-icons/svg/color/snt.svg';

class YourSNTBalance extends Component {
  render() {
    const t = this.props.t;
    return (
      <Fragment>
        <h3>{t('yourSNTBalance.label')}</h3>
        <p className="border rounded p-3">
          <span className={classnames("h3", "font-weight-normal", {'text-danger': this.props.disabled})}>
            <img src={SNTIcon} alt="SNT icon" className="mr-2"/>
            {(this.props.value || this.props.value === 0) && <Fragment>{this.props.value} SNT</Fragment>}
            {!this.props.value && this.props.value !== 0 && t('general.loading')}
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

export default withTranslation()(YourSNTBalance);
