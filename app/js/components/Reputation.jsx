import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Card } from 'reactstrap';
import { withNamespaces } from 'react-i18next';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsDown, faThumbsUp } from "@fortawesome/free-solid-svg-icons";

class Reputation extends Component {
  render() {
    return (
      <Row className="mt-4">
        <Col xs="12">
          <span className="font-weight-bold h5">{this.props.t('reputation.title')}</span>
        </Col>
        <Col xs="6" className="pr-0">
          <Card body className="text-center rounded-0">
            <div>
              <span className="mr-3">{this.props.reputation.upCount}</span>
              <FontAwesomeIcon className="text-warning" size="lg" icon={faThumbsUp}/>
            </div>
          </Card>
        </Col>
        <Col xs="6" className="pl-0">
          <Card body className="text-center rounded-0">
            <div>
              <span className="mr-3">{this.props.reputation.downCount}</span>
              <FontAwesomeIcon className="text-warning" size="lg" icon={faThumbsDown}/>
            </div>
          </Card>
        </Col>
      </Row>
    );
  }
}

Reputation.propTypes = {
  t: PropTypes.func,
  reputation: PropTypes.object
};

export default withNamespaces()(Reputation);
