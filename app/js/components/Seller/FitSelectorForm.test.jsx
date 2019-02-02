import React from "react";
import { shallow } from "enzyme";

import FiatSelectorForm from "./FiatSelectorForm";

describe('FiatSelectorForm', () => {
  it('should render correctly', () => {
    const component = shallow(<FiatSelectorForm value={{}} 
                                                currencies={[]}
                                                changeFiat={() => undefined}/>);
  
    expect(component).toMatchSnapshot();
  });
});
