/*global web3*/
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import DOMPurify from 'dompurify';
import {withTranslation} from "react-i18next";

import SellerPosition from '../../../components/EditLocation/SellerPosition';
import ModalDialog  from '../../../components/ModalDialog';
import newSeller from "../../../features/newSeller";
import metadata from "../../../features/metadata";
import RoundedIcon from "../../../ui/RoundedIcon";
import InfoRedIcon from "../../../../images/info-red.svg";
import {Button} from 'reactstrap';

class Location extends Component {
  constructor(props) {
    super(props);
    const location = props.seller.location || (props.profile && props.profile.location) || null;
    this.state = {
      location,
      showLocationDifferenceModal: false
    };
    this.validate(location);
    this.props.footer.beforePageChange((cb) => {
      if (!props.profile || !props.profile.location || props.profile.location === this.state.location) {
        return cb();
      }
      this.goNext = cb;
      this.setState({showLocationDifferenceModal: true});
    });
    this.props.footer.onPageChange(() => {
      this.props.setLocation(DOMPurify.sanitize(this.state.location));
    });
  }

  componentDidMount() {
    if (!this.props.seller.currency) {
      return this.props.wizard.previous();
    }
  }

  validate(location) {
    if (location !== null && location.trim() !== null) {
      this.props.footer.enableNext();
    } else {
      this.props.footer.disableNext();
    }
  }

  changeLocation = (location) => {
    this.setState({location});
    this.validate(location);
  };

  render() {
    const {t} = this.props;
    return <>
      <SellerPosition changeLocation={this.changeLocation} location={this.state.location}/>

      {this.state.showLocationDifferenceModal && <ModalDialog display={true} onClose={() => {}} hideButton>
        <RoundedIcon image={InfoRedIcon} bgColor="red" className="mb-2" />
        <h3>{t('sellerLocation.differentLocation')}</h3>
        <p>{t('sellerLocation.associatedWithProfile')}</p>
        <p>{t('sellerLocation.wantToContinue')}</p>
        <Button color="primary" onClick={this.goNext}>{t('sellerLocation.yesUse')}</Button>
        <Button color="link" onClick={() => {
          this.setState({location: this.props.profile.location}, () => {
            this.goNext();
          });
        }}>
          {t('sellerLocation.continueWithOld', {location: this.props.profile.location})}
        </Button>
      </ModalDialog>}
    </>;
  }
}

Location.propTypes = {
  t: PropTypes.func,
  wizard: PropTypes.object,
  seller: PropTypes.object,
  setLocation: PropTypes.func,
  footer: PropTypes.object,
  profile: PropTypes.object
};

const mapStateToProps = state => ({
  seller: newSeller.selectors.getNewSeller(state),
  profile: metadata.selectors.getProfile(state, web3.eth.defaultAccount)
});

export default connect(
  mapStateToProps,
  {
    setLocation: newSeller.actions.setLocation
  }
)(withTranslation()(Location));
