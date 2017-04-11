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
