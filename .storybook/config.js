import React from 'react';
import { configure, addDecorator } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Router } from 'react-router'
import createMemoryHistory from 'history/createMemoryHistory'

const history = createMemoryHistory();

history.push = action('history.push');
history.replace = action('history.replace');
history.go = action('history.go');
history.goBack = action('history.goBack');
history.goForward = action('history.goForward');

addDecorator(story => <Router history={history}>{story()}</Router>);

const req = require.context("../stories", true, /.stories.jsx$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);

import '../app/css/fonts/Inter/inter.css';
import '../app/css/bootstrap-overrides.scss';

// TODO: Move to dedicated component
import '../app/js/index.scss';
import '../app/css/Form.scss';
import '../app/js/i18n';
