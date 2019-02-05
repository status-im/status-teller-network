import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ContactForm from '../../components/ContactForm';
import buyer from "../../features/buyer";
import {connect} from "react-redux";

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
  contactCode: PropTypes.string
};

const mapStateToProps = state => ({
  contactCode: buyer.selectors.contactCode(state),
  nickname: buyer.selectors.nickname(state)
});

export default connect(
  mapStateToProps,
  {
    setContact: buyer.actions.setContact
  }
)(SellerContactContainer);
