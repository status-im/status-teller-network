import React from "react";
import { shallow } from "enzyme";

import LicenseInfo from "./LicenseInfo";

describe('LicenseInfo', () => {
  it('should render correctly', () => {
    const component = shallow(<LicenseInfo/>);
  
    expect(component).toMatchSnapshot();
  });
});
