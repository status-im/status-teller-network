import React from 'react';
import ReactDOM from 'react-dom';
import { ConnectedRouter } from "connected-react-router";
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';

import i18n from './i18n';

import 'bootstrap/dist/css/bootstrap.css';

import App from './layout/App';
import history from './history';
import store from './store';

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <I18nextProvider i18n={ i18n }>
        <App />
      </I18nextProvider>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);
