import React from "react";
import { shallow } from "enzyme";

import SellerContact from "./SellerContact";

describe('SellerContact', () => {
  it('should render correctly', () => {
    const component = shallow(<SellerContact changeNickname={() => undefined} changeContactCode={() => undefined}
                                             nickname={"nickname"} contractCode={"contractCode"} />);
  
    expect(component).toMatchSnapshot();
  });
});