import React from "react";
import { shallow } from "enzyme";

import UpdateButton from "./UpdateButton";

describe('UpdateButton', () => {
  it('should render correctly when disabled', () => {
    const component = shallow(<UpdateButton disabled={false} onClick={() => undefined}/>);
  
    expect(component).toMatchSnapshot();
  });

  it('should render correctly when enabled', () => {
    const component = shallow(<UpdateButton disabled={true} onClick={() => undefined}/>);
  
    expect(component).toMatchSnapshot();
  });
});
