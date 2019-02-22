import React from "react";
import { shallow } from "enzyme";

import UpdateUser from "./UpdateUser";

describe('UpdateUser', () => {
  it('should render correctly when disabled', () => {
    const component = shallow(<UpdateUser disabled={false} onClick={() => undefined}/>);
  
    expect(component).toMatchSnapshot();
  });

  it('should render correctly when enabled', () => {
    const component = shallow(<UpdateUser disabled={true} onClick={() => undefined}/>);
  
    expect(component).toMatchSnapshot();
  });
});
