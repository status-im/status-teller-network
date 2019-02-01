import React from "react";
import { shallow } from "enzyme";

import StatusContractCode from "./StatusContractCode";

describe('StatusContractCodeades', () => {
  it('should render correctly', () => {
    const component = shallow(<StatusContractCode />);
  
    expect(component).toMatchSnapshot();
  });
});
