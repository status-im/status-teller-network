import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {FormGroup} from 'reactstrap';
import {Typeahead} from 'react-bootstrap-typeahead';
import {withTranslation, Trans} from 'react-i18next';
import {compactAddress} from '../../../../utils/address';
import {Link} from "react-router-dom";
import {formatArbitratorName} from '../../../../utils/strings';

class ArbitratorSelectorForm extends Component {
  onChange = (items) => {
    if(items.length){
      const item = items[0];
      const index = item.substring(0, item.indexOf(' - '));
      this.props.changeArbitrator(this.props.arbitrators[parseInt(index, 10) - 1]);
    }
  };

  render() {
    const {t, value} = this.props;
    let defaultSelectedValue = [];

    const arbitratorStrings = this.props.arbitrators.map((arbitratorAddr, index) => {
      const user = this.props.users[arbitratorAddr];

      if(!user || !user.username) return null;

      let text = formatArbitratorName(user, arbitratorAddr, compactAddress(arbitratorAddr, 3), index);

      if (value && value === arbitratorAddr) {
        defaultSelectedValue.push(text);
      }
      return text;
    }).filter(x => x);

    return (
      <Fragment>
        <h2>{t('sellerArbitratorContainer.title')}</h2>
        <FormGroup>
          <Typeahead className="my-3"
                     id="fiatSelector"
                     clearButton
                     onChange={this.onChange}
                     options={arbitratorStrings}
                     placeholder={t("arbitratorSelectorForm.placeholder")}
                     submitFormOnEnter={true}
                     emptyLabel={t("arbitratorSelectorForm.emptyLabel")}
                     defaultSelected={defaultSelectedValue}
          />
          {!this.props.value && <p className="text-muted">{t("arbitratorSelectorForm.selectValid")}</p>}
        </FormGroup>
        {(!arbitratorStrings || arbitratorStrings.length === 0) &&
        <p className="text-warning">
          <Trans i18nKey="arbitratorSelectorForm.noApprovals">
            No arbitrator has approved you yet. To request approval from an arbitrator, go to <Link to="/profile/arbitrators">Manage
            arbitrators</Link> in your Profile
          </Trans>
        </p>
        }
      </Fragment>
    );
  }
}

ArbitratorSelectorForm.propTypes = {
  t: PropTypes.func,
  value: PropTypes.string,
  arbitrators: PropTypes.array,
  users: PropTypes.object,
  changeArbitrator: PropTypes.func
};

export default withTranslation()(ArbitratorSelectorForm);
