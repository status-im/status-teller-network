import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import {withRouter, Link} from "react-router-dom";
import network from '../../features/network';
import arbitration from '../../features/arbitration';
import metadata from '../../features/metadata';
import Loading from '../../components/Loading';
import ErrorInformation from '../../components/ErrorInformation';
import PropTypes from 'prop-types';
import BootstrapSwitchButton from 'bootstrap-switch-button-react';
import { ListGroup, ListGroupItem, Button, Row,  Col } from 'reactstrap';
import classnames from 'classnames';

const requestStatus = {};
requestStatus[arbitration.constants.AWAIT] = "Pending";
requestStatus[arbitration.constants.ACCEPTED] = "Accepted";
requestStatus[arbitration.constants.REJECTED] = "Rejected";

class SellerApproval extends Component {

  constructor(props) {
    super(props);
    props.checkLicenseOwner();
    props.getArbitratorRequests();    
    this.loadedUsers = [];
  }

  onToggleCheckbox = (checked) => {
    this.props.changeAcceptEveryone(checked);
  }
  

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
  }

  rejectRequest = id => () => {
    this.props.rejectRequest(id);
  }

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
        {<BootstrapSwitchButton onlabel="ON" offlabel="OFF" checked={acceptsEveryone} onChange={this.onToggleCheckbox}/>}
        
        { !acceptsEveryone && <Fragment>
          <h3 className="mb-2 mt-5">Requests for arbitrator</h3>
          <ListGroup>
          {requests.map((request, i) => {
            const user = users[request.seller];
            let text;
            if (!user) {
              text = request.seller + ' - Loading...';
            } else {
              text = `${user.username || "No username available"} ${user.location ? ' from ' + user.location : ''} - ${user.upCount || 0}↑  ${user.downCount || 0}↓`;
            }
            return <ListGroupItem key={i}>
              <Row>
                <Col  xs="12" sm="9" className="pb-3" tag={Link} to={`/profile/${request.seller}`}>
                  <span className="text-small">{request.seller}</span>
                  <br />
                  <span className={classnames("font-weight-bold")}>{text}</span>
                </Col>
                <Col xs="12" sm="3" className="text-center">
                  {request.status === arbitration.constants.AWAIT && <Button onClick={this.acceptRequest(request.id)} className="m-2">Accept</Button> }
                  {(request.status === arbitration.constants.AWAIT || request.status === arbitration.constants.ACCEPTED) && <Button className="m-2" onClick={this.rejectRequest(request.id)}>Reject</Button> }

                  <br />
                  <span className={classnames('text-small', {
                    'text-success': request.status === arbitration.constants.ACCEPTED,
                    'text-danger': request.status === arbitration.constants.REJECTED,
                    'text-muted': request.status === arbitration.constants.AWAIT
                  })}>({requestStatus[request.status]})</span>
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
