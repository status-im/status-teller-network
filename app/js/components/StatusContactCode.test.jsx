import React from "react";
import { shallow } from "enzyme";

import statusContactCode from "./statusContactCode";

describe('statusContactCodeades', () => {
  it('should render correctly', () => {
    const component = shallow(<statusContactCode value={"0xkajshdhkjashd"} />);
  
    expect(component).toMatchSnapshot();
  });
});
