import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Card} from 'reactstrap';
import {withNamespaces} from 'react-i18next';
import Blockies from 'react-blockies';

class Disputes extends Component {
  renderTrades() {
    return (
        this.props.disputes.map((dispute, index) => <Card key={index} body className="py-2 px-3 mb-3 shadow-sm">
          <div className="d-flex my-1">
            <span className="flex-fill align-self-center">
              <Blockies seed={dispute.buyer} className="align-middle rounded-circle topCircle"/>
              <Blockies seed={dispute.seller} className="align-middle rounded-circle bottomCircle"/>
              <span className="ml-2">{dispute.buyerInfo.username} & {dispute.sellerInfo.username}</span>
            </span>
            <span className="flex-fill align-self-center text-right">
              {this.props.showDate && 'TODO'}
            </span>
          </div>
          </Card>
        )
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
