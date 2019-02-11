import React from "react";
import { shallow } from "enzyme";

import SellerLicenseInfo from "./SellerLicenseInfo";

describe('SellerLicenseInfo', () => {
  it('should render correctly', () => {
    const component = shallow(<SellerLicenseInfo/>);
  
    expect(component).toMatchSnapshot();
  });
});
