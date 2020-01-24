import React from 'react';
import ReactDOM from 'react-dom';
import { ConnectedRouter } from "connected-react-router";
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import { LastLocationProvider } from 'react-router-last-location';
import i18n from './js/i18n';
import { PersistGate } from 'redux-persist/integration/react';

import './css/fonts/Inter/inter.css';
import './css/bootstrap-overrides.scss';
import 'flag-icon-css/css/flag-icon.min.css';
import './index.scss';
import './css/Form.scss';

import App from './js/layout/App';
import history from './js/history';
import {store, persistor} from './js/store';

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ConnectedRouter history={history}>
        <LastLocationProvider>
          <I18nextProvider i18n={i18n}>
            <App/>
          </I18nextProvider>
        </LastLocationProvider>
      </ConnectedRouter>
    </PersistGate>
  </Provider>,
  document.getElementById('root')
);
