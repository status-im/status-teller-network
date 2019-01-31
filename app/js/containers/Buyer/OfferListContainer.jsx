import React, {Component} from 'react';
import PropTypes from 'prop-types';
import OfferList from '../../components/Buyer/OfferList';

class OfferListContainer extends Component {
  constructor(props) {
    super(props);
    props.footer.hide();
  }

  render() {
    return (
      <OfferList/>
    );
  }
}

OfferListContainer.propTypes = {
  footer: PropTypes.object
};


export default OfferListContainer;
