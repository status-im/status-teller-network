import React from "react";
import { shallow } from "enzyme";

import SellerPosition from "./SellerPosition";

describe('SellerPosition', () => {
  it('should render correctly', () => {
    const component = shallow(<SellerPosition changeLocation={() => undefined} locatinon={""}/>);
  
    expect(component).toMatchSnapshot();
  });
});
