import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import {withRouter, Link} from "react-router-dom";
import network from '../../features/network';
import arbitration from '../../features/arbitration';
import license from '../../features/license';
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
    if (props.acceptsEveryone) {
      this.props.getLicenseOwners();
      this.props.getBlacklistedSellers();
    }
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

    if (!prevProps.acceptsEveryone && this.props.acceptsEveryone) {
      this.props.getLicenseOwners();
      this.props.getBlacklistedSellers();
    }
  }

  acceptRequest = id => () => {
    this.props.acceptRequest(id);
  };

  rejectRequest = id => () => {
    this.props.rejectRequest(id);
  };

  blacklist(e, sellerAddr) {
    e.preventDefault();
    this.props.blacklistSeller(sellerAddr);
  }

  unBlacklist(e, sellerAddr) {
    e.preventDefault();
    this.props.unBlacklistSeller(sellerAddr);
  }

  render(){
    const {loading, error, txHash, cancelArbitratorsActions, profile, acceptsEveryone, requests, users, sellers, blacklistedSellers} = this.props;
    if(error) {
      return <ErrorInformation transaction message={error} cancel={cancelArbitratorsActions}/>;
    }

    if(!profile.isArbitrator) {
      return <ErrorInformation message={"This feature is only available to arbitrators"}/>;
    }

    if(loading || (!sellers && acceptsEveryone)) return <Loading mining={true} txHash={txHash} />;

    return (
      <Fragment>
        <h2 className="mb-4">Seller Management</h2>
        <h3 className="mb-2">Accept all sellers</h3>
        <div>Off <Switch onChange={this.onToggleCheckbox} checked={acceptsEveryone} className="accept-all-switch"
                         onColor="#44D058"/> On
        </div>

        {!acceptsEveryone && <Fragment>
          <p className="mt-2 mb-0 text-muted">Setting this switch to &quot;On&quot; will make it so that all sellers can choose you as an arbitrator</p>
          <p className="mt-0 text-muted">If you activate it, you will still be able to blacklist sellers individually</p>
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

        {acceptsEveryone &&
        <Fragment>
          <h3 className="mb-2 mt-5">Blacklist sellers</h3>
          <p className="text-muted">Even though you accept every seller, you can blacklist some sellers if you suspect
            them to be malicious</p>
          <ListGroup>
            {sellers.map((seller, i) => {
              const isBlacklisted = blacklistedSellers.includes(seller.address);
              return (<ListGroupItem key={i}>
                <span
                  className="mr-2">{users[seller.address] && formatArbitratorName(users[seller.address], seller.address, 'No username', i)}{!users[seller.address] && seller.address}</span>
                {isBlacklisted &&
                <Button color="success" className="float-right" onClick={(e) => this.unBlacklist(e, seller.address)}>Un-Blacklist</Button>}
                {!isBlacklisted &&
                <Button color="danger" className="float-right" onClick={(e) => this.blacklist(e, seller.address)}>Blacklist</Button>}
              </ListGroupItem>);
            })}
          </ListGroup>
        </Fragment>}
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
  sellers: PropTypes.array,
  blacklistedSellers: PropTypes.array,
  getArbitratorRequests: PropTypes.func,
  getUser: PropTypes.func,
  blacklistSeller: PropTypes.func,
  unBlacklistSeller: PropTypes.func,
  users: PropTypes.object,
  acceptRequest: PropTypes.func,
  getLicenseOwners: PropTypes.func,
  getBlacklistedSellers: PropTypes.func,
  rejectRequest: PropTypes.func
};


const mapStateToProps = state => {
  const address = network.selectors.getAddress(state) || '';
  return {
    address,
    loading: arbitration.selectors.isLoading(state),
    error: arbitration.selectors.errorGet(state),
    txHash: arbitration.selectors.txHash(state),
    profile: metadata.selectors.getProfile(state, address),
    acceptsEveryone: arbitration.selectors.acceptsEveryone(state),
    requests: arbitration.selectors.getArbitratorRequests(state),
    users: metadata.selectors.getAllUsers(state),
    sellers: license.selectors.licenseOwners(state),
    blacklistedSellers: arbitration.selectors.getBlacklistedSellers(state)
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
    rejectRequest: arbitration.actions.rejectRequest,
    getLicenseOwners: license.actions.getLicenseOwners,
    blacklistSeller: arbitration.actions.blacklistSeller,
    unBlacklistSeller: arbitration.actions.unBlacklistSeller,
    getBlacklistedSellers: arbitration.actions.getBlacklistedSellers
  })(withRouter(SellerApproval));
