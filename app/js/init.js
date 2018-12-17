import web3 from "Embark/web3"
import EmbarkJS from 'Embark/EmbarkJS'
import store from './store'
import { fetchPrices } from './features/prices/actions'

const dispatch = action => store.dispatch(action)
const relevantPairs = {
  from: ['ETH', 'SNT'],
  to: ['USD']
}
export default () => {
  EmbarkJS.onReady(async (err) => {
    dispatch(fetchPrices(relevantPairs))
  })
}
