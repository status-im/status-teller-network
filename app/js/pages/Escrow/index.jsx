import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {Row, Col} from "reactstrap";

import Offer from '../../components/Offer';
import CancelEscrow from './components/CancelEscrow';
import CardEscrowSeller from './components/CardEscrowSeller';
import CardEscrowBuyer from './components/CardEscrowBuyer';
import EscrowDetail from './components/EscrowDetail';
import OpenChat from './components/OpenChat';
import OpenDispute from './components/OpenDispute';
import Loading from '../../components/Loading';
import FundEscrow from './components/FundEscrow';

import escrow from '../../features/escrow';
import network from '../../features/network';

class Escrow extends Component {
  constructor(props){
    super(props);
    props.getEscrow(props.escrowId);
    props.getFee();
  }

  state = {
    showFundingScreen: false
  }

  showFundingScreen = () => {
    this.setState({showFundingScreen: true});
  }

  render() {
    const {escrow, fee, address} = this.props;
    const {showFundingScreen} = this.state;

    if(!escrow){
      return <Loading/>;
    }
    
    const isBuyer = false;// escrow.buyer === address;
    
    const offer = escrow.offer;
    
    if(isBuyer){
      offer.user = escrow.sellerInfo;
    } else {
      offer.user = escrow.buyerInfo;
    }

    if(showFundingScreen) return <FundEscrow />;

    return (
      <div className="escrow">
        { isBuyer ? <CardEscrowBuyer /> : <CardEscrowSeller escrow={escrow} fee={fee} showFundingScreen={this.showFundingScreen} /> }
        <EscrowDetail escrow={escrow} />
        <Row className="bg-secondary py-4 mt-4">
          <Col>
            <h3 className="mb-3">You are trading with</h3>
            <Offer offer={offer}/>
          </Col>
        </Row>
        <OpenChat statusContactCode={offer.user.statusContactCode} />
        <CancelEscrow/>
        <OpenDispute/>
      </div>
    );
  }
}

Escrow.propTypes = {
  history: PropTypes.object,
  escrow: PropTypes.object,
  escrowId: PropTypes.string,
  getEscrow: PropTypes.func,
  getFee: PropTypes.func,
  fee: PropTypes.string,
  address: PropTypes.string
};


const mapStateToProps = (state, props) => {
  return {
    address: network.selectors.getAddress(state) || "",
    escrowId:  props.match.params.id.toString(),
    escrow: escrow.selectors.getEscrow(state),
    fee: escrow.selectors.getFee(state)
  };
};

export default connect(
  mapStateToProps,
  {
    getEscrow: escrow.actions.getEscrow,
    getFee: escrow.actions.getFee
  }
)(withRouter(Escrow));
