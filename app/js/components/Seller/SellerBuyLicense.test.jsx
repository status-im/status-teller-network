import React from "react";
import { shallow } from "enzyme";

import SellerBuyLicense from "./SellerBuyLicense";

describe('SellerBuyLicense', () => {
  it('should render correctly when disabled', () => {
    const component = shallow(<SellerBuyLicense disabled={false} onClick={() => undefined}/>);
  
    expect(component).toMatchSnapshot();
  });

  it('should render correctly when enabled', () => {
    const component = shallow(<SellerBuyLicense disabled={true} onClick={() => undefined}/>);
  
    expect(component).toMatchSnapshot();
  });
});
