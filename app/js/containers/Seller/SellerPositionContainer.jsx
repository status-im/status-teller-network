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
    if (location) {
      this.props.footer.enableNext();
      // TODO save location when going next
    } else {
      this.props.footer.disableNext();
    }
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
  footer: PropTypes.object
};


export default SellerStartContainer;
