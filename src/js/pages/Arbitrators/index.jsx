import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import {withRouter, Link} from "react-router-dom";
import { ListGroup, ListGroupItem, Button, Row,  Col } from 'reactstrap';
import classnames from 'classnames';
import metadata from '../../features/metadata';
import network from '../../features/network';
import arbitration from '../../features/arbitration';
import { addressCompare } from '../../utils/address';
import Loading from '../../components/Loading';
import ErrorInformation from '../../components/ErrorInformation';
import moment from 'moment';
import PropTypes from 'prop-types';
import { formatArbitratorName } from '../../utils/strings';
import {Trans, withTranslation} from "react-i18next";

class Arbitrators extends Component {
  constructor(props) {
    super(props);
    props.getArbitrators(props.address, true);
    this.loadedUsers = [];

  }

  componentDidUpdate(prevProps) {
    if ((!prevProps.arbitrators && this.props.arbitrators) || Object.keys(prevProps.arbitrators).length !== Object.keys(this.props.arbitrators).length || Object.keys(this.props.users).length === Object.keys(this.props.arbitrators).length) {
      Object.keys(this.props.arbitrators).forEach(arbitratorAddr => {
        if (!this.props.users[arbitratorAddr] && !this.loadedUsers.includes(arbitratorAddr)) {
          this.props.getUser(arbitratorAddr);
          this.loadedUsers.push(arbitratorAddr);
        }
      });
    }
  }

  requestArbitrator = (arbitrator) => () => {
    this.props.requestArbitrator(arbitrator);
  };

  cancelRequest = (arbitrator) => () => {
    this.props.cancelArbitratorRequest(arbitrator);
  };

  render(){
    const {t, arbitrators, users, loading, error, txHash, address, cancelArbitratorsActions} = this.props;
    if(error) {
      return <ErrorInformation transaction message={error} cancel={cancelArbitratorsActions}/>;
    }

    if (loading && txHash) return <Loading mining txHash={txHash}/>;

    return (
    <Fragment>
        <h2 className="mb-4">{t('arbitrators.title')}</h2>
        <p>{t('arbitrators.arbitratorsList')}</p>
        <ListGroup>
          {Object.keys(arbitrators).length === 0 && loading && <p>{t('arbitrators.loading')}</p>}
          {Object.keys(arbitrators).length === 0 && !loading && <Fragment>
            <p className="mb-0">{t('arbitrators.noArbis')}</p>
            <p>
              <Trans i18nKey="arbitrators.becomeArbi">
                Become one <Link to="/arbitrator/license">here</Link>
              </Trans>
            </p>
          </Fragment>}

        {Object.keys(arbitrators).map((arb, i) => {
          const isUser = addressCompare(address, arb);
          const enableDate = parseInt(arbitrators[arb].request.date, 10) + (86400 * 3) + 20;
          const isDisabled = (Date.now() / 1000) < enableDate;

          const text = formatArbitratorName(users[arb], arb) + (isUser ? ` (${t('general.you')})` : "");

          return <ListGroupItem key={i}>
            <Row>
              <Col  xs="12" sm="9" className="pb-3">
                <span className="text-small">{arb}</span>
                <br />
                <span className={classnames("font-weight-bold", {'text-success': isUser})}>{text}</span>
              </Col>
              <Col xs="12" sm="3" className="text-center">
                {!isUser && !arbitrators[arb].isAllowed && [arbitration.constants.NONE, arbitration.constants.REJECTED, arbitration.constants.CLOSED].indexOf(arbitrators[arb].request.status) > -1 &&
                <Button disabled={isDisabled} onClick={this.requestArbitrator(arb)}>{t('arbitrators.request')}</Button>}

                {arbitrators[arb].isAllowed && !isUser &&
                <p className="text-success mb-1">{t('arbitrators.available')}</p>}

                {!isUser && arbitrators[arb].request.status === arbitration.constants.AWAIT &&
                <Button onClick={this.cancelRequest(arb)}>{t('arbitrators.cancelRequest')}</Button>}

                {!isUser && [arbitration.constants.REJECTED, arbitration.constants.CLOSED].indexOf(arbitrators[arb].request.status) > -1 && isDisabled &&
                <span className="text-small text-muted">
                  {t('arbitrators.retryIn', {date: moment(enableDate * 1000).toNow(true)})}
                </span>}
              </Col>
            </Row>
          </ListGroupItem>;
        })}
      </ListGroup>
    </Fragment>
    );
  }
}

Arbitrators.propTypes = {
  t: PropTypes.func,
  arbitrators: PropTypes.object,
  users: PropTypes.object,
  address: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.string,
  txHash: PropTypes.string,
  getArbitrators: PropTypes.func,
  getUser: PropTypes.func,
  requestArbitrator: PropTypes.func,
  cancelArbitratorsActions: PropTypes.func,
  cancelArbitratorRequest: PropTypes.func
};


const mapStateToProps = state => {
  const address = network.selectors.getAddress(state) || '';
  return {
    address,
    arbitrators: arbitration.selectors.arbitrators(state),
    users: metadata.selectors.getAllUsers(state),
    loading: arbitration.selectors.isLoading(state),
    error: arbitration.selectors.errorGet(state),
    txHash: arbitration.selectors.txHash(state)
  };
};

export default connect(
  mapStateToProps,
  {
    getArbitrators: arbitration.actions.getArbitrators,
    getUser: metadata.actions.loadUserOnly,
    requestArbitrator: arbitration.actions.requestArbitrator,
    cancelArbitratorsActions: arbitration.actions.cancelArbitratorActions,
    cancelArbitratorRequest: arbitration.actions.cancelArbitratorRequest
  })(withRouter(withTranslation()(Arbitrators)));
