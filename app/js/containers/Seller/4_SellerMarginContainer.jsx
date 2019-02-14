import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import MarginSelectorForm from '../../components/Seller/MarginSelectorForm';
import Loading from '../../components/ui/Loading';
import newSeller from "../../features/newSeller";

class SellerMarginContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      margin: props.seller.margin,
      marketType: props.seller.marketType,
      ready: false
    };
    this.validate(props.seller.margin);
    props.footer.onPageChange(() => {
      props.setMargin(this.state.margin, this.state.marketType);
    });
  }

  componentDidMount() {
    if (!this.props.seller.currency) {
      this.props.wizard.previous();
    } else {
      this.setState({ready: true});
    }
  }

  validate(margin) {
    if (margin || margin === 0) {
      return this.props.footer.enableNext();
    }
    this.props.footer.disableNext();
  }

  marginChange = (margin) => {
    margin = parseInt(margin, 10);
    this.validate(margin);
    this.setState({margin});
  };

  marketTypeChange = (marketType) => {
    this.setState({marketType});
  };

  render() {
    if (!this.state.ready) {
      return <Loading/>;
    }

    return (
      <MarginSelectorForm currency={this.props.seller.currency}
                          margin={this.state.margin}
                          marginChange={this.marginChange}
                          marketType={this.state.marketType}
                          marketTypeChange={this.marketTypeChange}/>);
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
  seller: newSeller.selectors.getNewSeller(state)
});

export default connect(
  mapStateToProps,
  {
    setMargin: newSeller.actions.setMargin
  }
)(SellerMarginContainer);
