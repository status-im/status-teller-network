import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import {withRouter} from "react-router-dom";
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

class Arbitrators extends Component {
  constructor(props) {
    super(props);
    props.getArbitrators(props.address, true);
    this.loadedUsers = [];

  }

  componentDidUpdate(prevProps) {
    if ((!prevProps.arbitrators && this.props.arbitrators) || prevProps.arbitrators.length !== this.props.arbitrators.length || Object.keys(this.props.users).length < this.props.arbitrators.length) {
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
  }

  cancelRequest = (arbitrator) => () => {
    this.props.cancelArbitratorRequest(arbitrator);
  }

  render(){
    const {arbitrators, users, loading, error, txHash, address, cancelArbitratorsActions} = this.props;
    if(error) {
      return <ErrorInformation transaction message={error} cancel={cancelArbitratorsActions}/>;
    }

    if(loading) return <Loading mining={true} txHash={txHash} />;

    return (
    <Fragment>
        <h2 className="mb-4">Arbitrators</h2>
        <p>Here you can see a list of arbitrators that have approved you as a seller and request approval by those that have not.</p>
        <ListGroup>
        {Object.keys(arbitrators).map((arb, i) => {
          const isUser = addressCompare(address, arb);
          const enableDate = parseInt(arbitrators[arb].request.date, 10) + 86420;
          const isDisabled = (Date.now() / 1000) < enableDate;
          return <ListGroupItem key={i}>
            <Row>
              <Col  xs="12" sm="9" className="pb-3">
                <span className="text-small">{arb}</span>
                <br />
                <span className={classnames("font-weight-bold", {'text-success': isUser})}>{(users[arb] && users[arb].username ?  users[arb].username : "Arbitrator has no username") + (isUser ? " (You)" : "") }</span>
              </Col>
              <Col xs="12" sm="3" className="text-center">
                { !isUser && !arbitrators[arb].isAllowed && [arbitration.constants.NONE, arbitration.constants.REJECTED, arbitration.constants.CLOSED].indexOf(arbitrators[arb].request.status) > -1 && <Button disabled={isDisabled} onClick={this.requestArbitrator(arb)}>Request</Button> }
                { arbitrators[arb].isAllowed && !isUser && <span className="text-success">Available</span> }
                { !isUser && arbitrators[arb].request.status === arbitration.constants.AWAIT && <Button onClick={this.cancelRequest(arb)}>Cancel request</Button> }
                { !isUser && isDisabled && <span className="text-small text-muted">Retry in {moment(enableDate * 1000).toNow(true)}</span>}
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
  })(withRouter(Arbitrators));
