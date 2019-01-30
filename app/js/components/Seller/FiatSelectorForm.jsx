import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {FormGroup} from 'reactstrap';
import {Typeahead} from 'react-bootstrap-typeahead';
import {withNamespaces} from 'react-i18next';

class FiatSelectorForm extends Component {
  onInputChange = (text) => {
    const symbol = this.props.currencies.find(x => x.label === text);
    this.props.changeFiat(symbol);
  };

  onChange = (items) => {
    if(items.length){
      const item = items[0];
      this.props.changeFiat(item);
    }
  };

  render() {
    const {t, value} = this.props;

    const defaultSelectedValue = value.id ? [value] : [];

    return (
      <Fragment>
        <h2>{t('sellerFiatContainer.title')}</h2>
        <FormGroup>
          <Typeahead
            onChange={this.onChange}
            options={this.props.currencies}
            placeholder={t("fiatSelectorForm.placeholder")}
            onInputChange={this.onInputChange}
            submitFormOnEnter={true}
            emptyLabel={t("fiatSelectorForm.emptyLabel")}
            defaultSelected={defaultSelectedValue}
          />
          {!this.props.value.id && <p className="text-info">{t("fiatSelectorForm.selectValid")}</p>}
        </FormGroup>
      </Fragment>
    );
  }
}

FiatSelectorForm.propTypes = {
  t: PropTypes.func,
  value: PropTypes.object,
  currencies: PropTypes.array,
  changeFiat: PropTypes.func
};

export default withNamespaces()(FiatSelectorForm);
