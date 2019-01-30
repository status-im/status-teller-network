import React from "react";
import { shallow } from "enzyme";

import ProfileInformation from "./ProfileInformation";

describe('ProfileInformation', () => {
  it('should render correctly', () => {
    const component = shallow(<ProfileInformation />);
  
    expect(component).toMatchSnapshot();
  });
});
