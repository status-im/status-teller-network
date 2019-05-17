import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import newSeller from "../../../features/newSeller";
import arbitration from "../../../features/arbitration";
import network from "../../../features/network";
import ArbitratorSelectorForm from "./components/ArbitratorSelectorForm";

class SelectArbitrator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedArbitrator: props.seller.arbitrator
    };

    props.getArbitrators();
    
    this.validate(props.seller.arbitrator);

    props.footer.onPageChange(() => {
      props.setArbitrator(this.state.selectedArbitrator);
    });
  }

  componentDidMount() {
    if (!this.props.seller.paymentMethods.length) {
      return this.props.wizard.previous();
    }
    this.setState({ready: true});
  }

  validate(selectedArbitrator) {
    if (selectedArbitrator) {
      return this.props.footer.enableNext();
    }
    this.props.footer.disableNext();
  }

  changeArbitrator = (selectedArbitrator) => {
    if (!selectedArbitrator) {
      selectedArbitrator = '';
    }
    this.validate(selectedArbitrator);
    this.setState({selectedArbitrator});
  };

  render() {
    return (
      <ArbitratorSelectorForm 
        value={this.state.selectedArbitrator}
        arbitrators={this.props.arbitrators.filter(x => x !== this.props.address)}
        changeArbitrator={this.changeArbitrator} 
      />);
  }
}

SelectArbitrator.propTypes = {
  wizard: PropTypes.object,
  footer: PropTypes.object,
  seller: PropTypes.object,
  address: PropTypes.string,
  arbitrators: PropTypes.array,
  setArbitrator: PropTypes.func,
  getArbitrators: PropTypes.func
};

const mapStateToProps = state => ({
  address: network.selectors.getAddress(state) || '',
  seller: newSeller.selectors.getNewSeller(state),
  arbitrators: arbitration.selectors.arbitrators(state)
});

export default connect(
  mapStateToProps,
  {
    setArbitrator: newSeller.actions.setArbitrator,
    getArbitrators: arbitration.actions.getArbitrators
  }
)(SelectArbitrator);
