import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import EditContact from '../../../components/EditContact';
import newBuy from "../../../features/newBuy";
import network from "../../../features/network";
import {connect} from "react-redux";

class Contact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.username,
      statusContactCode: props.statusContactCode
    };
    this.validate(props.username, props.statusContactCode);
    props.footer.enableNext();
    props.footer.onPageChange(() => {
      props.setContactInfo({username: this.state.username, statusContactCode: this.state.statusContactCode});
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.statusContactCode !== this.props.statusContactCode) {
      this.changeStatusContactCode(this.props.statusContactCode);
    }
  }

  validate(username, statusContactCode) {
    if (username && statusContactCode) {
      return this.props.footer.enableNext();
    }
    this.props.footer.disableNext();
  }

  changeStatusContactCode = (statusContactCode) => {
    this.validate(this.state.username, statusContactCode);
    this.setState({statusContactCode});
  };

  changeUsername = (username) => {
    this.validate(username, this.state.statusContactCode);
    this.setState({username});
  };

  render() {
    return (
      <EditContact isStatus={this.props.isStatus}
                   statusContactCode={this.state.statusContactCode} 
                   username={this.state.username}
                   changeStatusContactCode={this.changeStatusContactCode}
                   changeUsername={this.changeUsername}
                   getContactCode={this.props.getContactCode} />
    );
  }
}

Contact.propTypes = {
  history: PropTypes.object,
  footer: PropTypes.object,
  setContactInfo: PropTypes.func,
  username: PropTypes.string,
  statusContactCode: PropTypes.string,
  isStatus: PropTypes.bool,
  getContactCode: PropTypes.func
};

const mapStateToProps = state => ({
  statusContactCode: newBuy.selectors.statusContactCode(state),
  username: newBuy.selectors.username(state),
  isStatus: network.selectors.isStatus(state)
});

export default connect(
  mapStateToProps,
  {
    setContactInfo: newBuy.actions.setContactInfo,
    getContactCode: network.actions.getContactCode
  }
  )(withRouter(Contact));
