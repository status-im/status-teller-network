import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Card} from 'reactstrap';
import Identicon from "../../../components/UserInformation/Identicon";
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import metadata from "../../../features/metadata";
import classnames from 'classnames';
import Loading from "../../../components/Loading";

class Dispute extends Component {
  constructor(props) {
    super(props);
    if (!props.sellerInfo) {
      props.loadProfile(props.dispute.seller);
    }
    if (!props.buyerInfo) {
      props.loadProfile(props.dispute.buyer);
    }
  }

  render() {
    const {dispute, buyerInfo, sellerInfo, enabled} = this.props;

    if (!buyerInfo || !sellerInfo) {
      return <Loading />;
    }

    return (<Card body className={classnames("py-2", "px-3", "mb-3", "shadow-sm", "border-0", {'card-transparent': !enabled})}>
        <div className="d-flex my-1">
            <span className="flex-fill align-self-center">
              <Link to={"/fallback/arbitration/" + dispute.escrowId}>
                 <Identicon seed={dispute.buyer} scale={5} className="align-middle rounded-circle topCircle border"/>
                 <Identicon seed={dispute.seller} scale={5} className="align-middle rounded-circle bottomCircle border"/>
                <span className="ml-2">{buyerInfo.username} & {sellerInfo.username}</span>
              </Link>
            </span>
          <span className="flex-fill align-self-center text-right">
              {this.props.showDate && dispute.arbitration.createDate}
            </span>
        </div>
      </Card>);
  }
}

Dispute.propTypes = {
  dispute: PropTypes.object,
  showDate: PropTypes.bool,
  sellerInfo: PropTypes.object,
  buyerInfo: PropTypes.object,
  loadProfile: PropTypes.func,
  enabled: PropTypes.bool
};

const mapStateToProps = (state, props) => {
  return {
    buyerInfo: metadata.selectors.getProfile(state, props.dispute.buyer),
    sellerInfo: metadata.selectors.getProfile(state, props.dispute.seller)
  };
};

export default connect(
  mapStateToProps,
  {
    loadProfile: metadata.actions.load
  })(Dispute);
