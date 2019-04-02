import React from "react";
import { shallow } from "enzyme";

import Loading from ".";

describe('Loading', () => {
  it('should render correctly when mining', () => {
    const component = shallow(<Loading mining />);

    expect(component).toMatchSnapshot();
  });

  it('should render correctly when initial', () => {
    const component = shallow(<Loading initial />);

    expect(component).toMatchSnapshot();
  });

  it('should render correctly when page', () => {
    const component = shallow(<Loading page />);

    expect(component).toMatchSnapshot();
  });
});
