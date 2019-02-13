import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";

import ContactForm from '../../components/ContactForm';
import newSeller from "../../features/newSeller";
import metadata from "../../features/metadata";

class SellerContactContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.seller.username,
      statusContactCode: props.seller.statusContactCode
    };
    props.footer.enableNext();
    props.footer.onPageChange(() => {
      props.setContactInfo({username: this.state.username, statusContactCode: this.state.statusContactCode});
      props.addSeller({...this.props.seller, username: this.state.username, statusContactCode: this.state.statusContactCode});
    });
  }

  changeStatusContactCode = (statusContactCode) => {
    this.setState({statusContactCode});
  };

  changeUsername = (username) => {
    this.setState({username});
  };

  render() {
    return (
      <ContactForm statusContactCode={this.state.statusContactCode} 
                   username={this.state.username}
                   changeStatusContactCode={this.changeStatusContactCode}
                   changeUsername={this.changeUsername}/>
    );
  }
}

SellerContactContainer.propTypes = {
  footer: PropTypes.object,
  setContactInfo: PropTypes.func,
  seller: PropTypes.object,
  addSeller: PropTypes.func
};

const mapStateToProps = state => ({
  seller: newSeller.selectors.getNewSeller(state)
});

export default connect(
  mapStateToProps,
  {
    setContactInfo: newSeller.actions.setContactInfo,
    addSeller: metadata.actions.addSeller
  }
)(SellerContactContainer);
