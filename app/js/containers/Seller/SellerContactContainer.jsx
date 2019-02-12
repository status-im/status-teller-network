import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ContactForm from '../../components/ContactForm';
import seller from "../../features/seller";
import {connect} from "react-redux";
import { __metadata } from 'tslib';

class SellerContactContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nickname: props.nickname,
      contactCode: props.contactCode
    };
    props.footer.enableNext();
    props.footer.onPageChange(() => {
      props.setContact({nickname: this.state.nickname, contactCode: this.state.contactCode});
      props.addSeller();
    });
  }

  changeContactCode = (contactCode) => {
    this.setState({contactCode});
  };

  changeNickname = (nickname) => {
    this.setState({nickname});
  };

  render() {
    return (
      <ContactForm contactCode={this.state.contactCode} nickname={this.state.nickname}
                   changeContactCode={this.changeContactCode} changeNickname={this.changeNickname}/>
    );
  }
}

SellerContactContainer.propTypes = {
  footer: PropTypes.object,
  setContact: PropTypes.func,
  nickname: PropTypes.string,
  contactCode: PropTypes.string,
  addSeller: PropTypes.func
};

const mapStateToProps = state => ({
  contactCode: seller.selectors.contactCode(state),
  nickname: seller.selectors.nickname(state)
});

export default connect(
  mapStateToProps,
  {
    setContact: seller.actions.setContact,
    addSeller: metadata.actions.addSeller
  }
)(SellerContactContainer);
