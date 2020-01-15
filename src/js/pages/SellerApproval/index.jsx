import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import {withRouter} from "react-router-dom";
import network from '../../features/network';
import arbitration from '../../features/arbitration';
import license from '../../features/license';
import metadata from '../../features/metadata';
import Loading from '../../components/Loading';
import ErrorInformation from '../../components/ErrorInformation';
import PropTypes from 'prop-types';
import Switch from "react-switch";
import SellerApprovalItem from "./SellerApprovalItem";

import './index.scss';
import {withTranslation} from "react-i18next";

class SellerApproval extends Component {

  constructor(props) {
    super(props);
    props.checkLicenseOwner();
    props.getArbitratorRequests();
    this.loadedUsers = [];
    if (props.acceptsEveryone) {
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
      this.props.getBlacklistedSellers();
    }
  }

  acceptRequest = (id) => {
    this.props.acceptRequest(id);
  };

  rejectRequest = (id) => {
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
    const {t, loading, error, txHash, cancelArbitratorsActions, profile, acceptsEveryone, requests, users, blacklistedSellers} = this.props;
    if(error) {
      return <ErrorInformation transaction message={error} cancel={cancelArbitratorsActions}/>;
    }

    if(!profile.isArbitrator) {
      return <ErrorInformation message={t('sellerApproval.onlyForArbis')}/>;
    }

    const sellers = this.props.offers.map(x => x.owner);

    if(loading || (!sellers && acceptsEveryone)) return <Loading mining={true} txHash={txHash} />;

    return (
      <Fragment>
        <h2 className="mb-4">{t('sellerApproval.title')}</h2>
        <h3 className="mb-2">{t('sellerApproval.acceptAll')}</h3>
        <div>Off <Switch onChange={this.onToggleCheckbox} checked={acceptsEveryone} className="accept-all-switch"
                         onColor="#44D058"/> On
        </div>

        {!acceptsEveryone && <Fragment>
          <p className="mt-2 mb-0 text-muted">{t('sellerApproval.settingSwitchToOn')}</p>
          <p className="mt-0 text-muted">{t('sellerApproval.ableToBlacklist')}</p>
          <h3 className="mb-2 mt-5">{t('sellerApproval.requestArbi')}</h3>
          {requests.length === 0 && <p>{t('sellerApproval.noRequests')}</p>}
          {requests.map((request, i) => (
            <SellerApprovalItem key={'approval-' + i} status={request.status} address={request.seller}
                                user={users[request.seller]} acceptRequest={() => this.acceptRequest(request.id)}
                                rejectRequest={() => this.rejectRequest(request.id)}/>))}
        </Fragment>
        }

        {acceptsEveryone &&
        <Fragment>
          <h3 className="mb-2 mt-5">{t('sellerApproval.blacklistSellers')}</h3>
          <p className="text-muted">{t('sellerApproval.blacklistExplanation')}</p>
          {sellers.map((seller, i) => {
            const isBlacklisted = blacklistedSellers.includes(seller);

            return <SellerApprovalItem key={'approval-' + i} status={isBlacklisted ? t('sellerApproval.blacklisted') : ''}
                                       address={seller}
                                       user={users[seller]} blacklist={(e) => this.blacklist(e, seller)}
                                       unBlacklist={(e) => this.unBlacklist(e, seller)}/>;
          })}
        </Fragment>}
      </Fragment>
    );
  }
}

SellerApproval.propTypes = {
  t: PropTypes.func,
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
  blacklistedSellers: PropTypes.array,
  getArbitratorRequests: PropTypes.func,
  getUser: PropTypes.func,
  blacklistSeller: PropTypes.func,
  unBlacklistSeller: PropTypes.func,
  users: PropTypes.object,
  acceptRequest: PropTypes.func,
  getBlacklistedSellers: PropTypes.func,
  rejectRequest: PropTypes.func,
  offers: PropTypes.array
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
    offers: metadata.selectors.getOffersWithUser(state),
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
  })(withRouter(withTranslation()(SellerApproval)));
