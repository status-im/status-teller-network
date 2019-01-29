import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Card, CardHeader, CardBody } from 'reactstrap';
import { Link } from "react-router-dom";
import {withNamespaces} from 'react-i18next';

class ProfileContainer extends Component {
  render() {
    const t = this.props.t;
    return (
      <Fragment>
        <Row>
          Denis
        </Row>
        <Row className="mt-4">
          <Col xs="12">
            <h5>My Reputation</h5>
          </Col>
          <Col xs="12">
            <Card body>
              hello
            </Card>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col xs="12">
            <span className="h5">My Trades</span>
            <Link to="find-offer" className="float-right">Find offer</Link>
          </Col>
          <Col xs="12">
            <Card body>
              hello
            </Card>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col xs="12">
            <span className="h5">My Offers</span>
            <Link to="create-offer" className="float-right">Create offer</Link>
          </Col>
          <Col xs="12">
            <Card>
              <CardHeader> Change </CardHeader>
              <CardBody>hello</CardBody>
            </Card>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col xs="12">
            <span className="h5">Status Contact Code</span>
            <Link to="edit-status-contract-code" className="float-right">Edit</Link>
          </Col>
          <Col xs="12">
            <Card body>
              hello
            </Card>
          </Col>
        </Row>
      </Fragment>
    );
  }
}

ProfileContainer.propTypes = {
  t: PropTypes.func
};

export default withNamespaces()(ProfileContainer);
