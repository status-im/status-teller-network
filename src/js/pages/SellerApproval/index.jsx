import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import {withRouter, Link} from "react-router-dom";
import network from '../../features/network';
import arbitration from '../../features/arbitration';
import metadata from '../../features/metadata';
import Loading from '../../components/Loading';
import ErrorInformation from '../../components/ErrorInformation';
import PropTypes from 'prop-types';
import { ListGroup, ListGroupItem, Button, Row,  Col } from 'reactstrap';
import Switch from "react-switch";
import classnames from 'classnames';
import { formatArbitratorName } from '../../utils/strings';

import './index.scss';

const requestStatus = {
  [arbitration.constants.AWAIT]: "Pending",
  [arbitration.constants.ACCEPTED]: "Accepted",
  [arbitration.constants.REJECTED]: "Rejected"
};

class SellerApproval extends Component {

  constructor(props) {
    super(props);
    props.checkLicenseOwner();
    props.getArbitratorRequests();
    this.loadedUsers = [];
  }

  onToggleCheckbox = (checked) => {
    this.props.changeAcceptEveryone(checked);
  };


  componentDidUpdate(prevProps) {
    if ((!prevProps.requests && this.props.requests) || prevProps.requests.length !== this.props.requests) {
      this.props.requests.map(x => x.seller).forEach(seller => {
        if (!this.props.users[seller] && !this.loadedUsers.includes(seller)) {
          this.props.getUser(seller);
          this.loadedUsers.push(seller);
        }
      });
    }
  }

  acceptRequest = id => () => {
    this.props.acceptRequest(id);
  };

  rejectRequest = id => () => {
    this.props.rejectRequest(id);
  };

  render(){
    const {loading, error, txHash, cancelArbitratorsActions, profile, acceptsEveryone, requests, users} = this.props;
    if(error) {
      return <ErrorInformation transaction message={error} cancel={cancelArbitratorsActions}/>;
    }

    if(!profile.isArbitrator) {
      return <ErrorInformation message={"This feature is only available to arbitrators"}/>;
    }

    if(loading) return <Loading mining={true} txHash={txHash} />;

    return (
      <Fragment>
        <h2 className="mb-4">Seller Management</h2>
        <h3 className="mb-2">Accept all sellers</h3>
        <div>Off <Switch onChange={this.onToggleCheckbox} checked={acceptsEveryone} className="accept-all-switch"
                         onColor="#44D058"/> On
        </div>
        <p className="mt-2">Setting this switch to &quot;On&quot; will make it so that all sellers can choose you as an arbitrator</p>

        {!acceptsEveryone && <Fragment>
          <h3 className="mb-2 mt-5">Requests for arbitrator</h3>
          <ListGroup>
            {requests.length === 0 && <p>No requests</p>}
            {requests.map((request, i) => {
                const text = formatArbitratorName(users[request.seller], request.seller);

                return <ListGroupItem key={i}>
                  <Row>
                    <Col xs="12" sm="9" className="pb-3" tag={Link} to={`/profile/${request.seller}`}>
                      <span className="text-small">{request.seller}</span>
                      <br/>
                      <span className={classnames("font-weight-bold")}>{text}</span>
                    </Col>
                    <Col xs="12" sm="3" className="text-center">
                      {request.status === arbitration.constants.AWAIT &&
                      <Button onClick={this.acceptRequest(request.id)} className="m-2">Accept</Button>}
                      {(request.status === arbitration.constants.AWAIT || request.status === arbitration.constants.ACCEPTED) &&
                      <Button className="m-2" onClick={this.rejectRequest(request.id)}>Reject</Button>}
                      <p className={classnames('text-small', {
                        'text-success': request.status === arbitration.constants.ACCEPTED,
                        'text-danger': request.status === arbitration.constants.REJECTED,
                        'text-muted': request.status === arbitration.constants.AWAIT
                      })}>
                        ({requestStatus[request.status]})
                      </p>
                    </Col>
                  </Row>
                </ListGroupItem>;
              }
            )}
          </ListGroup>
        </Fragment>
        }

      </Fragment>
    );
  }
}

SellerApproval.propTypes = {
  address: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.string,
  txHash: PropTypes.string,
  requestArbitrator: PropTypes.func,
  cancelArbitratorsActions: PropTypes.func,
  changeAcceptEveryone: PropTypes.func,
  checkLicenseOwner: PropTypes.func,
  acceptsEveryone: PropTypes.bool,
  profile: PropTypes.object,
  requests: PropTypes.array,
  getArbitratorRequests: PropTypes.func,
  getUser: PropTypes.func,
  users: PropTypes.object,
  acceptRequest: PropTypes.func,
  rejectRequest: PropTypes.func
};


const mapStateToProps = state => {
  const address = network.selectors.getAddress(state) || '';
  return {
    address,
    loading: arbitration.selectors.isLoading(state),
    error: arbitration.selectors.errorGet(state),
    txHash: arbitration.selectors.txHash(state),
    profile: metadata.selectors.getProfile(state, address) ,
    acceptsEveryone: arbitration.selectors.acceptsEveryone(state),
    requests: arbitration.selectors.getArbitratorRequests(state),
    users: metadata.selectors.getAllUsers(state)
    };
};

export default connect(
  mapStateToProps,
  {
    cancelArbitratorsActions: arbitration.actions.cancelArbitratorActions,
    changeAcceptEveryone: arbitration.actions.changeAcceptEveryone,
    checkLicenseOwner: arbitration.actions.checkLicenseOwner,
    getArbitratorRequests: arbitration.actions.getArbitratorRequests,
    getUser: metadata.actions.loadUserOnly,
    acceptRequest: arbitration.actions.acceptRequest,
    rejectRequest: arbitration.actions.rejectRequest
  })(withRouter(SellerApproval));
