import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import SellerPosition from '../../components/Seller/SellerPosition';
import Footer from '../../components/Footer';

class SellerStartContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: ''
    };
  }

  changeLocation = (location) => {
    this.setState({location});
    // TODO save location when going next
  };

  render() {
    return (
      <Fragment>
        <SellerPosition changeLocation={(newPos) => this.changeLocation(newPos)}/>
        {<Footer previous={this.props.wizard.prev} next={this.props.wizard.next} ready={!!this.state.location}/>}
      </Fragment>
    );
  }
}

SellerStartContainer.propTypes = {
  wizard: PropTypes.object
};


export default SellerStartContainer;
