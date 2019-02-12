import React from "react";
import { shallow } from "enzyme";

import LicenseBuy from "./LicenseBuy";

describe('LicenseBuy', () => {
  it('should render correctly when disabled', () => {
    const component = shallow(<LicenseBuy disabled={false} onClick={() => undefined}/>);
  
    expect(component).toMatchSnapshot();
  });

  it('should render correctly when enabled', () => {
    const component = shallow(<LicenseBuy disabled={true} onClick={() => undefined}/>);
  
    expect(component).toMatchSnapshot();
  });
});
