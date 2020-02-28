import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Card} from 'reactstrap';
import {withTranslation} from 'react-i18next';
import Dispute from './Dispute';
import classnames from 'classnames';

class Disputes extends Component {
  renderTrades(enabled) {
    return (
        this.props.disputes.map((dispute, index) => <Dispute key={'dispute-' + index} enabled={enabled} dispute={dispute} showDate={this.props.showDate} isFallbackDispute={this.props.includeFallbackDisputes}/>)
    );
  }

  renderEmpty(enabled) {
    const {t} = this.props;
    return (
      <Card body className={classnames("text-center", "border-0", "shadow-sm", {'card-transparent': !enabled})}>
        {t("disputes.noRecords")}
      </Card>
    );
  }

  render() {
    const {t, disputes, open, includeFallbackDisputes, unresolved} = this.props;
    if (unresolved && (!disputes || !disputes.length)) {
      return '';
    }
    return (
      <div className="mt-3 mb-4">
        <div>
          <h3 className="d-inline-block">
            {!unresolved && <>{!includeFallbackDisputes && <>{open ? t("disputes.openedDisputes") : t("disputes.resolvedDisputes")}</>}
            {includeFallbackDisputes && <>{open ? t("disputes.openedDisputesFallback") : t("disputes.resolvedDisputesFallback")}</>}</>}
            {unresolved && t("disputes.unresolvedDisputes")}
          </h3>
        </div>
        {disputes.length === 0 ? this.renderEmpty(open) : this.renderTrades(open)}
      </div>
    );
  }
}

Disputes.propTypes = {
  t: PropTypes.func,
  disputes: PropTypes.array,
  showDate: PropTypes.bool,
  open: PropTypes.bool,
  unresolved: PropTypes.bool,
  includeFallbackDisputes: PropTypes.bool
};

export default withTranslation()(Disputes);
