import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";

import ContactForm from '../../components/ContactForm';
import Loading from '../../components/ui/Loading';
import newSeller from "../../features/newSeller";
import metadata from "../../features/metadata";

class SellerContactContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.seller.username,
      statusContactCode: props.seller.statusContactCode,
      ready: false
    };
    props.footer.enableNext();
    props.footer.onPageChange(() => {
      props.setContactInfo({username: this.state.username, statusContactCode: this.state.statusContactCode});
      props.addOffer({...this.props.seller, username: this.state.username, statusContactCode: this.state.statusContactCode});
    });
  }

  componentDidMount() {
    if (!this.props.seller.margin || this.props.seller.margin === 0) {
      this.props.wizard.previous();
    } else {
      this.setState({ready: true});
    }
  }

  changeStatusContactCode = (statusContactCode) => {
    this.setState({statusContactCode});
  };

  changeUsername = (username) => {
    this.setState({username});
  };

  render() {
    if (!this.state.ready) {
      return <Loading page/>;
    }

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
  wizard: PropTypes.object,
  setContactInfo: PropTypes.func,
  seller: PropTypes.object,
  addOffer: PropTypes.func
};

const mapStateToProps = state => ({
  seller: newSeller.selectors.getNewSeller(state)
});

export default connect(
  mapStateToProps,
  {
    setContactInfo: newSeller.actions.setContactInfo,
    addOffer: metadata.actions.addOffer
  }
)(SellerContactContainer);
