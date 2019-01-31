import React, {Component} from 'react';
import PropTypes from 'prop-types';
import SellerContact from '../../components/Seller/SellerContact';
import seller from "../../features/seller";
import {connect} from "react-redux";

class SellerContactContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nickname: props.nickname,
      contactCode: props.contactCode
    };
    this.validate(props.nickname, props.contactCode);
    props.footer.onPageChange(() => {
      props.setContact({nickname: this.state.nickname, contactCode: this.state.contactCode});
    });
  }

  validate(nickname, contactCode) {
    if (contactCode && nickname) {
      this.props.footer.enableNext();
    } else {
      this.props.footer.disableNext();
    }
  }

  changeContactCode = (contactCode) => {
    this.validate(this.state.nickname, contactCode);
    this.setState({contactCode});
  };

  changeNickname = (nickname) => {
    this.validate(this.state.contactCode, nickname);
    this.setState({nickname});
  };

  render() {
    return (
      <SellerContact contactCode={this.state.contactCode} nickname={this.state.nickname}
                     changeContactCode={this.changeContactCode} changeNickname={this.changeNickname}/>
    );
  }
}

SellerContactContainer.propTypes = {
  footer: PropTypes.object,
  setContact: PropTypes.func,
  nickname: PropTypes.string,
  contactCode: PropTypes.string
};

const mapStateToProps = state => ({
  contactCode: seller.selectors.contactCode(state),
  nickname: seller.selectors.nickname(state)
});

export default connect(
  mapStateToProps,
  {
    setContact: seller.actions.setContact
  }
)(SellerContactContainer);
