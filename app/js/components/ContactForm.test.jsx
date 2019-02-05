import React from "react";
import { shallow } from "enzyme";

import ContactForm from "./ContactForm";

describe('SellerContact', () => {
  it('should render correctly', () => {
    const component = shallow(<ContactForm changeNickname={() => undefined} changeContactCode={() => undefined}
                                           nickname={"nickname"} contractCode={"contractCode"} />);

    expect(component).toMatchSnapshot();
  });
});
