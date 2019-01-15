import React from "react";
import { shallow } from "enzyme";

import License from "./License";

describe('License', () => {
  it('should render correctly', () => {
    const component = shallow(<License />);
  
    expect(component).toMatchSnapshot();
  });

  it('should render when being license owner', () => {
    const component = shallow(<License isLicenseOwner />);
  
    expect(component).toMatchSnapshot();
  });
});
