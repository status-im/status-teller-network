import React from 'react';
import {Card, CardHeader, CardBody, CardTitle, Button, Alert, ButtonGroup} from 'reactstrap';
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

const License = (props) => (
  <Card className="mt-2">
    <CardHeader>
      <CardTitle>License</CardTitle>
    </CardHeader>
    <CardBody>
      {props.error && <Alert color="danger">{this.props.error}</Alert>}
      {props.isLicenseOwner ? <IsLicenseOwner/> : <BuyLicense buyLicense={props.buyLicense}/>}
      <p>Rating: {props.userRating ? props.userRating : '-'}</p>

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
  buyLicense: PropTypes.func
};

export default License;
