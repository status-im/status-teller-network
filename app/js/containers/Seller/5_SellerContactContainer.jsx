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
      statusContractCode: props.seller.statusContractCode
    };
    props.footer.enableNext();
    props.footer.onPageChange(() => {
      props.setContactInfo({username: this.state.username, statusContractCode: this.state.statusContractCode});
      props.addSeller({...this.props.seller, username: this.state.username, statusContractCode: this.state.statusContractCode});
    });
  }

  changeStatusContractCode = (statusContractCode) => {
    this.setState({statusContractCode});
  };

  changeUsername = (username) => {
    this.setState({username});
  };

  render() {
    return (
      <ContactForm statusContractCode={this.state.statusContractCode} 
                   username={this.state.username}
                   changeStatusContractCode={this.changeStatusContractCode}
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
