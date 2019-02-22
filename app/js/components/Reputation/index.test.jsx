import React from "react";
import { shallow } from "enzyme";

import Reputation from "./index";

describe('Reputation', () => {
  it('should render correctly', () => {
    const component = shallow(<Reputation reputation={{upCount: 1, downCount: 2}} />);
  
    expect(component).toMatchSnapshot();
  });
});
