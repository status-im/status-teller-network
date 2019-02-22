import React from "react";
import { shallow } from "enzyme";

import SellerPaymentMethod from "./SellerPaymentMethod";

describe('SellerPaymentMethod', () => {
  it('should render correctly', () => {
    const component = shallow(<SellerPaymentMethod methods={[]} togglePaymentMethod={() => undefined} selectedMethods={[]}/>);
  
    expect(component).toMatchSnapshot();
  });
});
