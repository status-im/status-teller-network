import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Card, CardHeader, CardBody } from 'reactstrap';
import { Link } from "react-router-dom";
import { withNamespaces } from 'react-i18next';
import Blockies from 'react-blockies';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsDown, faThumbsUp } from "@fortawesome/free-solid-svg-icons";

class ProfileContainer extends Component {
  render() {
    const t = this.props.t;
    return (
      <Fragment>
        <Row className="my-5 text-center">
          <Col xs="12">
            <Blockies seed={"denis"} className="rounded-circle"/>
          </Col>
          <Col xs="12">
            <h4 className="font-weight-bold">Denis</h4>
          </Col>
          <Col xs="12">
            <p className="text-muted">0x2376423784623784632784678324</p>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col xs="12">
            <span className="font-weight-bold h5">My reputation</span>
          </Col>
          <Col xs="6" className="pr-0">
            <Card body className="text-center">
              <div>
                <span className="mr-3">0</span>
                <FontAwesomeIcon className="text-warning" size="lg" icon={faThumbsUp}/>
              </div>
            </Card>
          </Col>
          <Col xs="6" className="pl-0">
            <Card body className="text-center">
              <div>
                <span className="mr-3">0</span>
                <FontAwesomeIcon className="text-warning" size="lg" icon={faThumbsDown}/>
              </div>
            </Card>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col xs="12">
            <span className="font-weight-bold h5">My trades</span>
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
            <span className="font-weight-bold h5">My offers</span>
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
            <span className="font-weight-bold h5">Status contact code</span>
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
