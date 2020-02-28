/* eslint-disable no-alert,no-restricted-globals */
import React, {Fragment, Component} from 'react';
import {Row, Col} from 'reactstrap';
import PropTypes from 'prop-types';
import RoundedIcon from "../../../ui/RoundedIcon";
import ConfirmDialog from "../../../components/ConfirmDialog";
import CancelIcon from "../../../../images/close.svg";
import classnames from 'classnames';
import {withTranslation} from "react-i18next";

class CancelDispute extends Component {

  state = {
    displayDialog: false
  };

  displayDialog = show => (e) => {
    if (e) e.preventDefault();
    this.setState({displayDialog: show});
    return false;
  };

  cancelDispute = () => {
    this.props.cancelDispute(this.props.trade.escrowId);
    this.displayDialog(false)();
  };

  render() {
    const t = this.props.t;
    return <Fragment>
      <div onClick={this.displayDialog(true)} className="clickable">
        <Row className={classnames("mt-4 text-primary")}>
          <Col xs="12">
            <RoundedIcon image={CancelIcon} bgColor="red" className="float-left mr-2"/>
            <h6 className="mb-0 mt-2 font-weight-normal text-danger">{t('escrow.cancel.cancelDispute')}</h6>
          </Col>
        </Row>

      </div>
      <ConfirmDialog display={this.state.displayDialog} onConfirm={this.cancelDispute}
                     onCancel={this.displayDialog(false)} title={t('escrow.cancel.cancelDispute')}
                     content={t('escrow.cancel.youSure')}
                     cancelText={t('general.no')}/>
    </Fragment>;
  }
}

CancelDispute.propTypes = {
  t: PropTypes.func,
  cancelDispute: PropTypes.func,
  trade: PropTypes.object,
  isBuyer: PropTypes.bool
};

export default withTranslation()(CancelDispute);
