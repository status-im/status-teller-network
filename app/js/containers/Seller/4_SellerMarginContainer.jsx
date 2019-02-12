import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSpinner} from "@fortawesome/free-solid-svg-icons";

import MarginSelectorForm from '../../components/Seller/MarginSelectorForm';
import newSeller from "../../features/newSeller";

class SellerMarginContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      margin: props.margin
    };
    this.validate(props.margin);
    props.footer.onPageChange(() => {
      props.setMarginRate(this.state.margin);
    });
  }

  componentDidMount() {
    if (!this.props.fiat || !this.props.fiat.id) {
      this.props.wizard.previous();
    }
  }

  validate(newMargin) {
    if (newMargin.rate || newMargin.rate === 0) {
      return this.props.footer.enableNext();
    }
    this.props.footer.disableNext();
  }

  onMarginChange = (margin) => {
    const newMargin = Object.assign({}, this.state.margin, margin);
    this.validate(newMargin);
    this.setState({margin: newMargin});
  };

  render() {
    if (!this.props.fiat || !this.props.fiat.id) {
      return <p><FontAwesomeIcon icon={faSpinner} className="loading"/>Loading...</p>;
    }

    return (
      <MarginSelectorForm fiat={this.props.fiat} margin={this.state.margin} onMarginChange={this.onMarginChange}/>);
  }
}

SellerMarginContainer.propTypes = {
  t: PropTypes.func,
  setMargin: PropTypes.func,
  seller: PropTypes.object,
  wizard: PropTypes.object,
  footer: PropTypes.object
};

const mapStateToProps = state => ({
  seller: newSeller.selectors.seller(state)
});

export default connect(
  mapStateToProps,
  {
    setMargin: newSeller.actions.setMargin
  }
)(SellerMarginContainer);
