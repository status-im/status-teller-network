import React, {Component} from "react";
import PropTypes from "prop-types";
import RoundedIcon from "../../../ui/RoundedIcon";
import {withTranslation} from "react-i18next";
import {Col, Row, Button} from "reactstrap";
import ModalDialog from "../../../components/ModalDialog";
import exclamationCircle from "../../../../images/exclamation-circle.png";
import questionIcon from "../../../../images/question-mark.svg";
import arbitratorIcon from "../../../../images/arbitrator.svg";
import moment from "moment";

class DisputeWarning extends Component {
  state = {showArbitratorDetailsModal: false};

  displayDialog(visible) {
    this.setState({showArbitratorDetailsModal: visible});
  }

  render() {
    const {t, arbitrationTimeout, isExpired} = this.props;

    return (<div className="mt-2">
      <Row className="mb-3">
        <Col xs="2">
          <RoundedIcon image={exclamationCircle} bgColor="red"/>
        </Col>
        <Col xs="10 my-auto text-danger">
          <p className="m-0">{t('escrow.page.tradeInDispute')}</p>
        </Col>
      </Row>

      {isExpired && <>
        <p className="mb-3">{t('escrow.dispute.dueToInactivity')}</p>
        {arbitrationTimeout && <p>{t('escrow.dispute.pleaseWait')}</p>}
        <p className="mb-4">
          {t('escrow.dispute.whoIsFallback')}
          <RoundedIcon image={questionIcon} className="d-inline-block clickable ml-2" bgColor="blue" size="sm"
                       onClick={() => this.displayDialog(true)}/>
        </p>
      </>}

      {!isExpired && <>
        <p className="mb-3">{t('escrow.dispute.getInTouch')}</p>
        {arbitrationTimeout && <p>{t('escrow.dispute.deadline')}
          <span className="font-weight-medium d-block">
          {moment(arbitrationTimeout).toNow(true)}
        </span>
        </p>}
        <p className="mb-4">
          {t('escrow.dispute.whatIfInactive')}
          <RoundedIcon image={questionIcon} className="d-inline-block clickable ml-2" bgColor="blue" size="sm"
                       onClick={() => this.displayDialog(true)}/>
        </p>
      </>}


      <ModalDialog display={this.state.showArbitratorDetailsModal} onClose={() => this.displayDialog(false)}
                   hideButton>
        <RoundedIcon image={arbitratorIcon} bgColor="blue" className="mb-2"/>
        <h3>{isExpired ? t('escrow.dispute.fallbackArbitrator') : t('escrow.dispute.whatIfInactive')}</h3>
        <p
          className="text-muted">{isExpired ? t('escrow.dispute.fallbackDescription') : t('escrow.dispute.noWorries')}</p>
        <Button color="primary" onClick={() => this.displayDialog(false)}>{t('escrow.dispute.ok')}</Button>
      </ModalDialog>
    </div>);
  }
}

DisputeWarning.propTypes = {
  t: PropTypes.func,
  arbitrationTimeout: PropTypes.number.isRequired,
  isExpired: PropTypes.bool
};

export default withTranslation()(DisputeWarning);
