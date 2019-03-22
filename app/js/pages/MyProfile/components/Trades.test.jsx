import React from "react";
import { shallow } from "enzyme";

import Trades from "./Trades";

describe('Trades', () => {
  it('should render correctly', () => {
    const component = shallow(<Trades trades={[{buyerInfo: {username: 'Name'}, seller: {username: 'Name'},  token: { symbol: 'SNT' }, offer: { owner: '0x0', user: { username: 'Name' } }, value: '2', status: 'open'}]} />);
  
    expect(component).toMatchSnapshot();
  });

  it('should render when empty', () => {
    const component = shallow(<Trades trades={[]} />);
  
    expect(component).toMatchSnapshot();
  });
});
