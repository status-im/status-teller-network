import React from "react";
import { shallow } from "enzyme";

import Offers from "./Offers";

describe('Offers', () => {
  it('should render correctly', () => {
    const component = shallow(<Offers location="London" offers={
      [
        {
          asset: '0x0',
          token: {
            symbol: 'ETH'
          },
          currency: 'EUR',
          paymentMethods: ['Credit Card'],
          margin: 1,
          marketType: 1
        }
      ]
    } />);
  
    expect(component).toMatchSnapshot();
  });

  it('should render when empty', () => {
    const component = shallow(<Offers offers={[]} />);
  
    expect(component).toMatchSnapshot();
  });
});
