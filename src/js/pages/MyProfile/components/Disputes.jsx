import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Card} from 'reactstrap';
import {withNamespaces} from 'react-i18next';
import Dispute from './Dispute';

class Disputes extends Component {
  renderTrades() {
    return (
        this.props.disputes.map((dispute, index) => <Dispute key={'dispute-' + index} dispute={dispute} showDate={this.props.showDate}/>)
    );
  }

  renderEmpty() {
    const {t} = this.props;
    return (
      <Card body className="text-center">
        {t("disputes.noRecords")}
      </Card>
    );
  }

  render() {
    const {t, disputes, open} = this.props;
    return (
      <div className="mt-3">
        <div>
          <h3 className="d-inline-block">{open ? t("disputes.openedDisputes") : t("disputes.resolvedDisputes")}</h3>
        </div>
        {disputes.length === 0 ? this.renderEmpty(t) : this.renderTrades()}
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

export default withNamespaces()(Disputes);
