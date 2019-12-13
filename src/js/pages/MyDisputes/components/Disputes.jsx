import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Card} from 'reactstrap';
import {withTranslation} from 'react-i18next';
import Dispute from './Dispute';
import classnames from 'classnames';

class Disputes extends Component {
  renderTrades(enabled) {
    return (
        this.props.disputes.map((dispute, index) => <Dispute key={'dispute-' + index} enabled={enabled} dispute={dispute} showDate={this.props.showDate}/>)
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
    const {t, disputes, open} = this.props;
    return (
      <div className="mt-3 mb-4">
        <div>
          <h3 className="d-inline-block">{open ? t("disputes.openedDisputes") : t("disputes.resolvedDisputes")}</h3>
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
  open: PropTypes.bool
};

export default withTranslation()(Disputes);
