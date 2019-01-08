import React from 'react';
import { 
  Card, CardHeader, CardBody, CardTitle, Button 
} from 'reactstrap';


const BuyLicense = (props) => (
  <Button onClick={props.buyLicense}>Buy License</Button>
);

const IsLicenseOwner = () => <p>You already own a license</p>;

const License = (props) => (
  <Card>
    <CardHeader>
      <CardTitle>License</CardTitle>
    </CardHeader>
    <CardBody>
      {props.isLicenseOwner ? <IsLicenseOwner/> : <BuyLicense buyLicense={props.buyLicense}/>}
    </CardBody>
  </Card>
);

export default License;
