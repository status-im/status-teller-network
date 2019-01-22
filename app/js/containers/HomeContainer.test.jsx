import React from "react";
import { shallow } from "enzyme";

import HomeContainer from "./HomeContainer";

describe('License', () => {
  it('should render correctly', () => {
    const component = shallow(<HomeContainer />);
  
    expect(component).toMatchSnapshot();
  });
});
