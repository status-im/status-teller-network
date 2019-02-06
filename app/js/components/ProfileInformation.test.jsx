import React from "react";
import { shallow } from "enzyme";

import ProfileInformation from "./ProfileInformation";

describe('ProfileInformation', () => {
  it('should render correctly', () => {
    const component = shallow(<ProfileInformation address={"0x123123123"} username={"Eric"} />);
  
    expect(component).toMatchSnapshot();
  });
});
