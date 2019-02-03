import React, {Component} from 'react';
import OfferTrade from '../../components/Buyer/OfferTrade';
import PropTypes from 'prop-types';

class OfferTradeContainer extends Component {
  constructor(props) {
    super(props);
    this.address = this.props.match.params.address;
    this.offerId = this.props.match.params.offerId;
    // TODO get seller and offer information
  }

  render() {
    return (<OfferTrade address={this.address} name={'Roger'} max={200} min={600} asset={'ETH'}
                        fiat={{id: 'USD', symbol: '$'}}/>);
  }
}

OfferTradeContainer.propTypes = {
  match: PropTypes.object
};

export default OfferTradeContainer;
