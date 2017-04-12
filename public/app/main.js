import angular from 'angular';
import 'angular-route';
import axios from './axios';
import get from 'lodash/get';
import 'components/font-awesome';

import 'lumapps/lumX/dist/lumx';
import 'lumapps/lumX/dist/lumx.css!css';

import DashboardController from './dashboard';
import dashboardTpl from './dashboard.html!text';

import './styles.css';

const BASE_URI = 'https://wt-511d6c5e91afae05e2f1468adca2fdd5-0.run.webtask.io/webtask-auth0-rules';

function getRulesContext () {
  return axios({
    url: `${BASE_URI}/api/rules`,
    method: 'get'
  })
    .then(response => get(response, 'data'))
    .catch(error => console.log(error));
}

angular
  .module('webtask-auth0-rules', ['ngRoute', 'lumx'])
  .config(function ($routeProvider) {
    $routeProvider.when('/', {
      controller: DashboardController,
      controllerAs: 'vm',
      template: dashboardTpl,
      resolve: {
        rulesContext: getRulesContext
      }
    });
  });
