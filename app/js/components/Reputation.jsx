import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Card } from 'reactstrap';
import { withNamespaces } from 'react-i18next';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsDown, faThumbsUp } from "@fortawesome/free-solid-svg-icons";

class Reputation extends Component {
  render() {
    const t = this.props.t;
    return (
      <Row className="mt-4">
        <Col xs="12">
          <span className="font-weight-bold h5">My reputation</span>
        </Col>
        <Col xs="6" className="pr-0">
          <Card body className="text-center rounded-0">
            <div>
              <span className="mr-3">0</span>
              <FontAwesomeIcon className="text-warning" size="lg" icon={faThumbsUp}/>
            </div>
          </Card>
        </Col>
        <Col xs="6" className="pl-0">
          <Card body className="text-center rounded-0">
            <div>
              <span className="mr-3">0</span>
              <FontAwesomeIcon className="text-warning" size="lg" icon={faThumbsDown}/>
            </div>
          </Card>
        </Col>
      </Row>
    );
  }
}

Reputation.propTypes = {
  t: PropTypes.func
};

export default withNamespaces()(Reputation);
