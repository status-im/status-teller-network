import React, {Fragment} from 'react';
import {ListGroup, ListGroupItem, Alert} from 'reactstrap';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';

const SellerList = (props) => (
  <Fragment>
    <h2 className="mt-4">{props.t('sellerList.title')}</h2>
    {props.licenseOwnersError &&
    <Alert color="danger">{props.t('sellerList.error')} {props.licenseOwnersError}</Alert>}
    {props.licenseOwners && <ListGroup>
      {props.licenseOwners.map(owner =>
        <ListGroupItem key={owner.address}>{props.t('sellerList.address')} {owner.address}</ListGroupItem>)}
    </ListGroup>}
  </Fragment>
);

SellerList.propTypes = {
  t: PropTypes.func,
  licenseOwners: PropTypes.array,
  licenseOwnersError: PropTypes.string
};

export const SellerListComponent = SellerList;
export default withNamespaces()(SellerList);
