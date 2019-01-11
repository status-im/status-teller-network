import React from 'react';
import {Card, CardHeader, CardBody, CardTitle, Button, Alert, ButtonGroup} from 'reactstrap';
import CreateEscrowForm from "./CreateEscrow";
import PropTypes from 'prop-types';

const BuyLicense = (props) => (
  <Button onClick={props.buyLicense}>Buy License</Button>
);
BuyLicense.propTypes = {
  buyLicense: PropTypes.func
};

const IsLicenseOwner = () => <p>You already own a license</p>;

const Buttons = ({rate}) => {
  const buttons = [];
  for (let i = 1; i <= 5; i++) {
    buttons.push(<Button key={'rating-' + i} onClick={() => rate(i)}>{i}</Button>);
  }
  return buttons;
};

//Escrow.methods.create(buyer, value, TestUtils.zeroAddress, expirationTime).send({from: seller, value});
// const expirationTime = parseInt((new Date()).getTime() / 1000, 10) + 3600;
const License = (props) => (
  <Card>
    <CardHeader>
      <CardTitle>License</CardTitle>
    </CardHeader>
    <CardBody>
      {props.error && <Alert color="danger">{this.props.error}</Alert>}
      {props.isLicenseOwner ? <IsLicenseOwner/> : <BuyLicense buyLicense={props.buyLicense}/>}
      <p>Rating: {props.userRating}</p>

      <CreateEscrowForm create={props.createEscrow}/>

      <form>
        <label className="mr-3">Rate the transaction:</label>
        <ButtonGroup>
          <Buttons rate={props.rate}/>
        </ButtonGroup>
      </form>
    </CardBody>
  </Card>
);

License.propTypes = {
  error: PropTypes.string,
  isLicenseOwner: PropTypes.bool,
  userRating: PropTypes.number,
  rate: PropTypes.func,
  createEscrow: PropTypes.func,
  buyLicense: PropTypes.func
};

export default License;
