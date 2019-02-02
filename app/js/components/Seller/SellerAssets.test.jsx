import React from "react";
import { shallow } from "enzyme";

import SellerAssets from "./SellerAssets";

describe('SellerAssets', () => {
  it('should render correctly', () => {
    const component = shallow(<SellerAssets selectAsset={() => undefined} selectedAsset={1} assets={[]}/>);
  
    expect(component).toMatchSnapshot();
  });
});
