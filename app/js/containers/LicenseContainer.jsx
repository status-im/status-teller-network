import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Card, CardHeader, CardBody,
         CardTitle, Button } from 'reactstrap';
import license from '../features/license';


const BuyLicense = (props) => (
  <Button onClick={props.buyLicense}>Buy License</Button>
)

const IsLicenseOwner = () => <p>You already own a license</p>;

class LicenseContainer extends Component {
  componentDidMount() {
    this.props.checkLicenseOwner();
  }

  buyLicense = () => {
    this.props.buyLicense()
  }

  render() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>License</CardTitle>
        </CardHeader>
        <CardBody>
          {this.props.isLicenseOwner ? <IsLicenseOwner/> : <BuyLicense buyLicense={this.buyLicense}/>}
        </CardBody>
      </Card>
    )
  }
}

const mapStateToProps = state => ({
  isLicenseOwner: license.selectors.isLicenseOwner(state),
})

export default connect(
  mapStateToProps, 
  { 
    buyLicense: license.actions.buyLicense,
    checkLicenseOwner: license.actions.checkLicenseOwner
  }
)(LicenseContainer)
