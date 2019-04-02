import React from 'react';
import { configure, addDecorator } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Router } from 'react-router';
const createMemoryHistory = require("history").createMemoryHistory;

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

import '../src/css/fonts/Inter/inter.css';
import '../src/css/bootstrap-overrides.scss';

// TODO: Move to dedicated component
import '../src/index.scss';
import '../src/css/Form.scss';
import '../src/js/i18n';
