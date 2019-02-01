import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col, FormGroup, Button} from 'reactstrap';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import Blockies from 'react-blockies';
import {isNumber} from "../../validators";

const OfferTrade = ({address, name, min, max, fiat, asset}) => (
  <Row>
    <Col xs="12" className="mt-5 text-center">
      <h2>Trade amount with <br/><span><Blockies seed={address} className="rounded-circle"/> {name}</span></h2>
      <p className="mt-3">Min: {min}{fiat.symbol} - Max: {max}{fiat.symbol}</p>
    </Col>
    <Col xs="12" className="mt-4">
      <Form className="text-center">
        <FormGroup>
          <Input type="number" name="fiat" className="form-control" validations={[isNumber]}/>
          <span className="input-icon">{fiat.id}</span>
        </FormGroup>
        <FormGroup>
          <Input type="number" name="asset" className="form-control" validations={[isNumber]}/>
          <span className="input-icon">{asset}</span>
        </FormGroup>
        <Button color="primary" className="px-4">Open trade</Button>
      </Form>
    </Col>
  </Row>
);

OfferTrade.propTypes = {
  address: PropTypes.string,
  name: PropTypes.string,
  fiat: PropTypes.object,
  min: PropTypes.number,
  max: PropTypes.number,
  asset: PropTypes.string
};

export default OfferTrade;
