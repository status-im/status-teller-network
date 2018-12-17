import React from 'react';
import ReactDOM from 'react-dom';
import { ConnectedRouter } from "connected-react-router";
import { Provider } from 'react-redux';

import 'bootstrap/dist/css/bootstrap.css';

import App from './layout/App';
import history from './history';
import store from './store';
import init from './init';

init();

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);
