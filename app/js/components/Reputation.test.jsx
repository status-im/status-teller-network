import React from "react";
import { shallow } from "enzyme";

import Reputation from "./Reputation";

describe('Trades', () => {
  it('should render correctly', () => {
    const component = shallow(<Reputation />);
  
    expect(component).toMatchSnapshot();
  });
});
