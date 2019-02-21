import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ContactForm from '../../components/ContactForm';
import buyer from "../../features/buyer";
import network from "../../features/network";
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

  componentDidUpdate(prevProps) {
    if (prevProps.statusContactCode !== this.props.statusContactCode) {
      this.changeStatusContactCode(this.props.statusContactCode);
    }
  }

  changeContactCode = (contactCode) => {
    this.setState({contactCode});
  };

  changeNickname = (nickname) => {
    this.setState({nickname});
  };

  render() {
    return (
      <ContactForm isStatus={this.props.isStatus}
                   statusContactCode={this.state.contactCode} 
                   username={this.state.nickname}
                   changeStatusContactCode={this.changeContactCode}
                   changeUsername={this.changeNickname}
                   getContactCode={this.props.getContactCode} />
    );
  }
}

SellerContactContainer.propTypes = {
  footer: PropTypes.object,
  setContact: PropTypes.func,
  nickname: PropTypes.string,
  contactCode: PropTypes.string,
  isStatus: PropTypes.bool,
  getContactCode: PropTypes.func,
  statusContactCode: PropTypes.string
};

const mapStateToProps = state => ({
  contactCode: buyer.selectors.contactCode(state),
  nickname: buyer.selectors.nickname(state),
  isStatus: network.selectors.isStatus(state),
  statusContactCode: network.selectors.getStatusContactCode(state)
});

export default connect(
  mapStateToProps,
  {
    setContact: buyer.actions.setContact,
    getContactCode: buyer.actions.getContactCode
  }
)(SellerContactContainer);
