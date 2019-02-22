import React from "react";
import { shallow } from "enzyme";

import Reputation from "./Reputation";

describe('Trades', () => {
  it('should render correctly', () => {
    const component = shallow(<Reputation reputation={{upCount: 1, downCount: 2}} />);
  
    expect(component).toMatchSnapshot();
  });
});
