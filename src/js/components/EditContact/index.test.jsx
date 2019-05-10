import React from "react";
import { shallow } from "enzyme";

import EditContact from "./index";

describe('EditContact', () => {
  it('should render correctly', () => {
    const component = shallow(<EditContact changeNickname={() => undefined} changeContactCode={() => undefined}
                                           resolveENSName={() => undefined} ensError="" nickname={"nickname"} statusContactCode={"contractCode"} />);

    expect(component).toMatchSnapshot();
  });
});
