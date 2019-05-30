import React, {Component} from "react";
import PropTypes from 'prop-types';
import {withRouter} from "react-router-dom";
import {Button} from "reactstrap";
import arrow from "../../../images/arrow.png";

const BLACK_LIST = ['/', '/offers/list', '/sell/*'];

class BackButton extends Component {
  state = {
    hidden: null
  };

  componentDidMount() {
    this.checkLocation();
  }

  checkLocation() {
    const hidden = !!BLACK_LIST.find(blackListedLink => {
      const starIndex = blackListedLink.indexOf('*');
      if (starIndex > -1) {
        blackListedLink = blackListedLink.substring(0, starIndex);
        return this.props.location.pathname.startsWith(blackListedLink);
      }
      return BLACK_LIST.includes(this.props.location.pathname);
    });
    this.setState({hidden});
  }

  componentDidUpdate(prevProps) {
    if (this.state.hidden === null || prevProps.location.pathname !== this.props.location.pathname) {
     this.checkLocation();
    }
  }

  render() {
    if (this.state.hidden) {
      return null;
    }
    return (<p className="back-button">
      <Button color="link" className="p-0" onClick={this.props.history.goBack}>
        <img className="fa-rotate-180 footer-arrow mr-2" src={arrow} alt="previous arrow"/> Back
      </Button>
    </p>);
  }
}

BackButton.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object
};

export default withRouter(BackButton);
