import React, {Component} from "react";
import PropTypes from 'prop-types';
import {withRouter} from "react-router-dom";
import {Button} from "reactstrap";
import arrow from "../../../images/arrow.png";

const BLACK_LIST = ['/', '/offers/list', '/sell/*'];

class BackButton extends Component {
  recentHistory = [];
  state = {
    hidden: null
  };

  componentDidMount() {
    this.checkLocation();
    this.recentHistory.push({pathname: this.props.location.pathname, timestamp: Date.now()});
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

      // Check to see if we didn't just go back and forth
      this.recentHistory.push({pathname: this.props.location.pathname, timestamp: Date.now()});
      if (this.recentHistory.length > 3) {
        this.recentHistory.splice(0, this.recentHistory.length - 3);
      }
      if (this.recentHistory.length === 3) {
        if (this.recentHistory[0].pathname === this.recentHistory[2].pathname) {
          // We went back and forth
          if (this.recentHistory[2].timestamp - this.recentHistory[1].timestamp < 100) {
            // If the delay between is less than 0.1 sec, it means the we have been redirected
            // This means we need to go 2 back instead of 1 back
            this.props.history.go(-2);
          }
        }
      }
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
