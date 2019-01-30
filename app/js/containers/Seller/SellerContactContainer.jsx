import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import SellerContact from '../../components/Seller/SellerContact';

class SellerContactContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nickname: '',
      contactCode: ''
    };
  }

  changeContactCode = (contactCode) => {
    this.setState({contactCode});
    if (contactCode && this.state.nickname) {
      this.props.footer.enableNext();
      // TODO save location when going next
    } else {
      this.props.footer.disableNext();
    }
  };

  changeNickname = (nickname) => {
    this.setState({nickname});
    if (nickname && this.state.contactCode) {
      this.props.footer.enableNext();
      // TODO save location when going next
    } else {
      this.props.footer.disableNext();
    }
  };

  render() {
    return (
      <Fragment>
        <SellerContact contactCode={this.state.contactCode} nickname={this.state.nickname}
                       changeContactCode={this.changeContactCode} changeNickname={this.changeNickname}/>
      </Fragment>
    );
  }
}

SellerContactContainer.propTypes = {
  footer: PropTypes.object
};


export default SellerContactContainer;
