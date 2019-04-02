import React from "react";
import { shallow } from "enzyme";

import YourSNTBalance from "./Balance";

describe('YourSNTBalance', () => {
  it('should render correctly', () => {
    const component = shallow(<YourSNTBalance value={"10"}/>);
  
    expect(component).toMatchSnapshot();
  });
});
