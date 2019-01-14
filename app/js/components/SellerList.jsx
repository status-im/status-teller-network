import React, {Fragment} from 'react';
import {ListGroup, ListGroupItem, Alert} from 'reactstrap';
import PropTypes from 'prop-types';

const SellerList = (props) => (
  <Fragment>
    <h2 className="mt-4">ETH Sellers</h2>
    {props.licenseOwnersError &&
    <Alert color="danger">Error getting seller list: {props.licenseOwnersError}</Alert>}
    {props.licenseOwners && <ListGroup>
      {props.licenseOwners.map(owner =>
        <ListGroupItem key={owner.address}>Address: {owner.address}</ListGroupItem>)}
    </ListGroup>}
  </Fragment>
);

SellerList.propTypes = {
  licenseOwners: PropTypes.array,
  licenseOwnersError: PropTypes.string
};

export default SellerList;
