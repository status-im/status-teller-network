import {configure} from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import * as jest from "jest";

configure({adapter: new Adapter()});

jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate HoC receive the t function as a prop
  withTranslation: () => Component => {
    Component.defaultProps = { ...Component.defaultProps, t: () => "" };
    return Component;
  }
}));
