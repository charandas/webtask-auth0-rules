import angular from 'angular';
import uiRouter from 'angular-ui-router';
import 'angular-busy';
import 'auth0/lock';
import 'auth0-js';
import 'angular-lock';
import 'angular-jwt';
import Bluebird from 'bluebird';

import 'angular-route';

import 'lumapps/lumX/dist/lumx';
import 'lumapps/lumX/dist/lumx.css!css';

import config from 'webtask-auth0-rules/config.json!json';

import LoginController from './login';
import loginTpl from './login.html!text';
import DashboardController from './dashboard';
import dashboardTpl from './dashboard.html!text';
import CallbackController from './callback';
import callbackTpl from './callback.html!text';

import serviceModule from './service/module';

import 'mdi/css/materialdesignicons.css!css';
import 'tobiasahlin/SpinKit/css/spinners/4-wandering-cubes.css!css';
import './styles.css';

angular
  .module('webtask-auth0-rules', [
    'ngRoute',
    'lumx',
    'cgBusy',
    'auth0.lock',
    'angular-jwt',
    uiRouter,
    serviceModule
  ])
  .controller('LoginController', LoginController)
  .controller('CallbackController', CallbackController)
  .controller('DashboardController', DashboardController)
  .value('cgBusyDefaults', {
    message: '',
    backdrop: true,
    templateUrl: 'app/cgBusyTemplate.html',
    delay: 0,
    minDuration: 0
  })
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, jwtOptionsProvider, lockProvider) {
    'ngInject';
    $urlRouterProvider.otherwise('/login');
    $locationProvider.hashPrefix('');
    // This setting would require additionally configuration on github pages
    // but is necessary to have lock work with access tokens
    $locationProvider.html5Mode(true);

    jwtOptionsProvider.config({
      tokenGetter: function () {
        return window.localStorage.getItem('id_token');
      }
    });

    $stateProvider
      .state('login', {
        url: '/',
        template: loginTpl,
        controller: 'LoginController',
        controllerAs: 'vm'
      })
      .state('callback', {
        url: '/callback',
        template: callbackTpl,
        controller: 'CallbackController',
        controllerAs: 'vm'
      })
      .state('dashboard', {
        url: '/dashboard',
        controller: 'DashboardController',
        controllerAs: 'vm',
        template: dashboardTpl
      });

    lockProvider.init({
      clientID: config.clientId,
      domain: config.domainUrl,
      options: {
        _idTokenVerification: false,
        auth: {
          redirectUrl: config.redirectUrl,
          responseType: 'id_token token',
          params: {
            audience: config.customRulesApiAudience,
            scope: 'openid profile offline_access',
            device: 'Chrome browser'
          }
        }
      }
    });
  })
  .run(function ($rootScope, authService, authManager, lock) {
    'ngInject';
    lock.interceptHash();
    $rootScope.authService = authService;
    authService.registerAuthenticationListener();
    authManager.checkAuthOnRefresh();

    Bluebird.setScheduler(function (fn) {
      $rootScope.$evalAsync(fn);
    });
  });
