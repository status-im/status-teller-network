import React from "react";
import { shallow } from "enzyme";

import MarginSelectorForm from "./MarginSelectorForm";

describe('MarginSelectorForm', () => {
  it('should render correctly', () => {
    const component = shallow(<MarginSelectorForm margin={0}
                                                  token={{symbol: 'SNT'}}
                                                  prices={{'SNT': {'USD': 1}}}
                                                  marketType={0}
                                                  currency={""}
                                                  onMarketTypeChange={() => undefined}
                                                  onMarginChange={() => undefined}/>);
  
    expect(component).toMatchSnapshot();
  });
});
