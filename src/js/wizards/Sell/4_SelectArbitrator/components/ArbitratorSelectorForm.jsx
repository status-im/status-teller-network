import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {FormGroup, Input, Label} from 'reactstrap';
import {Typeahead} from 'react-bootstrap-typeahead';
import {withNamespaces} from 'react-i18next';
import {compactAddress} from '../../../../utils/address';

class ArbitratorSelectorForm extends Component {
  onChange = (items) => {
    if(items.length){
      const item = items[0];
      const index = item.substring(0, item.indexOf(' - '));
      this.props.changeArbitrator(this.props.arbitrators[parseInt(index, 10)]);
    }
  };

  render() {
    const {t, value} = this.props;
    let defaultSelectedValue = [];

    const arbitratorStrings = this.props.arbitrators.map((arbitratorAddr, index) => {
      const user = this.props.users[arbitratorAddr];

      let text;
      if (!user) {
        text = arbitratorAddr + ' - Loading...';
      } else {
        text = `${index} - ${user.username || compactAddress(arbitratorAddr, 3)}${user.location ? ' from ' + user.location : ''} - ${user.upCount || 0}↑  ${user.downCount || 0}↓`;
      }
      if (value && value === arbitratorAddr) {
        defaultSelectedValue.push(text);
      }
      return text;
    });

    return (
      <Fragment>
        <h2>{t('sellerArbitratorContainer.title')}</h2>
        <FormGroup>
          <Typeahead className="my-3"
            id="fiatSelector"
            onChange={this.onChange}
            options={arbitratorStrings}
            placeholder={t("arbitratorSelectorForm.placeholder")}
            submitFormOnEnter={true}
            emptyLabel={t("arbitratorSelectorForm.emptyLabel")}
            defaultSelected={defaultSelectedValue}
            disabled={this.props.noArbitrator}
          />
          {!this.props.value && <p className="text-muted">{t("arbitratorSelectorForm.selectValid")}</p>}
        </FormGroup>
        <FormGroup>
          <Label className="ml-4 text-muted">
            <Input type="checkbox" onChange={this.props.onSelectNoArbitrator} checked={this.props.noArbitrator} /> Create offer without using an arbitrator
          </Label>
        </FormGroup>
      </Fragment>
    );
  }
}

ArbitratorSelectorForm.propTypes = {
  t: PropTypes.func,
  value: PropTypes.string,
  arbitrators: PropTypes.array,
  users: PropTypes.object,
  changeArbitrator: PropTypes.func,
  onSelectNoArbitrator: PropTypes.func,
  noArbitrator: PropTypes.bool
};

export default withNamespaces()(ArbitratorSelectorForm);
