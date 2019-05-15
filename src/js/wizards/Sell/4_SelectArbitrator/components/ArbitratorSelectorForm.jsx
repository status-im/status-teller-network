import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {FormGroup} from 'reactstrap';
import {Typeahead} from 'react-bootstrap-typeahead';
import {withNamespaces} from 'react-i18next';

class ArbitratorSelectorForm extends Component {
  onInputChange = (text) => {
    const arbitrator = this.props.arbitrators.find(x => x === text);
    if (arbitrator) {
      this.props.changeArbitrator(arbitrator);
    }

  };

  onChange = (items) => {
    if(items.length){
      const item = items[0];
      this.props.changeArbitrator(item);
    }
  };

  render() {
    const {t, value} = this.props;
    let defaultSelectedValue = [];
    if (value) {
      const arbitrator = this.props.arbitrators.find(x => x === value);
      defaultSelectedValue.push(arbitrator);
    }

    return (
      <Fragment>
        <h2>Select an Arbitrator</h2>
        <FormGroup>
          <Typeahead className="my-3"
            id="fiatSelector"
            onChange={this.onChange}
            options={this.props.arbitrators}
            placeholder="0x0000...0000"
            onInputChange={this.onInputChange}
            submitFormOnEnter={true}
            emptyLabel="Empty"
            defaultSelected={defaultSelectedValue}
          />
          {!this.props.value && <p className="text-muted">Select a valid arbitrator</p>}
        </FormGroup>
      </Fragment>
    );
  }
}

ArbitratorSelectorForm.propTypes = {
  t: PropTypes.func,
  value: PropTypes.string,
  arbitrators: PropTypes.array,
  changeArbitrator: PropTypes.func
};

export default withNamespaces()(ArbitratorSelectorForm);
