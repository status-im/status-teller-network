import React from "react";
import { shallow } from "enzyme";

import StatusContactCode from "./StatusContactCode";

describe('StatusContactCode', () => {
  it('should render correctly', () => {
    const component = shallow(<StatusContactCode value={"0xkajshdhkjashd"} />);
  
    expect(component).toMatchSnapshot();
  });
});
