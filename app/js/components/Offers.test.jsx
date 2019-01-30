import React from "react";
import { shallow } from "enzyme";

import Offers from "./Offers";

describe('Offers', () => {
  it('should render correctly', () => {
    const component = shallow(<Offers offers={
      [
        {
          from: 'ETH',
          to: 'EUR',
          type: 'Selling',
          location: 'Berlin',
          paymentMethod: 'Credit Card',
          rate: '1.5% above Bitfinex'
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
