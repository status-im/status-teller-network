import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import SellerPosition from '../../components/Seller/SellerPosition';

class SellerStartContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: ''
    };
  }

  changeLocation = (location) => {
    this.setState({location});
    this.enableNext();
    // TODO save location when going next
  };

  render() {
    return (
      <Fragment>
        <SellerPosition changeLocation={(newPos) => this.changeLocation(newPos)} location={this.state.location}/>
      </Fragment>
    );
  }
}

SellerStartContainer.propTypes = {
  wizard: PropTypes.object,
  enableNext: PropTypes.func
};


export default SellerStartContainer;
