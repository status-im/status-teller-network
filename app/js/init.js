import EmbarkJS from 'Embark/EmbarkJS';
import store from './store';
import { fetchPrices } from './features/prices/actions';

const dispatch = action => store.dispatch(action);
const relevantPairs = {
  from: ['ETH', 'SNT'],
  to: ['USD']
};
export default () => {
  EmbarkJS.onReady(async (_err) => {
    dispatch(fetchPrices(relevantPairs));
  });
};
