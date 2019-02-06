import React from "react";
import { shallow } from "enzyme";

import StatusContractCode from "./StatusContractCode";

describe('StatusContractCodeades', () => {
  it('should render correctly', () => {
    const component = shallow(<StatusContractCode value={"0xkajshdhkjashd"} />);
  
    expect(component).toMatchSnapshot();
  });
});
