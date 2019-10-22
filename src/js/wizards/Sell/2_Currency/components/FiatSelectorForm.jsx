import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {FormGroup, Label} from 'reactstrap';
import {Typeahead} from 'react-bootstrap-typeahead';
import {withNamespaces} from 'react-i18next';

class FiatSelectorForm extends Component {
  onInputChange = (text) => {
    const symbol = this.props.currencies.find(x => x.label === text);
    if (symbol) {
      this.props.changeCurrency(symbol.id);
    }

  };

  onChange = (items) => {
    if(items.length){
      const item = items[0];
      this.props.changeCurrency(item.id);
    }
  };

  render() {
    const {t, value} = this.props;
    let defaultSelectedValue = [];
    if (value) {
      const currency = this.props.currencies.find(x => x.id === value);
      defaultSelectedValue.push(currency);
    }

    return (
      <Fragment>
        <h2>{t('sellerFiatContainer.title')}</h2>
        <FormGroup>
          <Label className="text-small mt-3 mb-0">Local currency</Label>
          <Typeahead className="mb-3"
            id="fiatSelector"
            onChange={this.onChange}
            options={this.props.currencies}
            placeholder={t("fiatSelectorForm.placeholder")}
            onInputChange={this.onInputChange}
            submitFormOnEnter={true}
            emptyLabel={t("fiatSelectorForm.emptyLabel")}
            defaultSelected={defaultSelectedValue}
          />
        </FormGroup>
      </Fragment>
    );
  }
}

FiatSelectorForm.propTypes = {
  t: PropTypes.func,
  value: PropTypes.string,
  currencies: PropTypes.array,
  changeCurrency: PropTypes.func
};

export default withNamespaces()(FiatSelectorForm);
