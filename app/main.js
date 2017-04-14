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
    $urlRouterProvider.otherwise('/dashboard');
    $locationProvider.hashPrefix('');

    jwtOptionsProvider.config({
      tokenGetter: function () {
        return window.localStorage.getItem('id_token');
      }
    });

    $stateProvider
      .state('login', {
        url: '/'
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

    console.log(config.redirectUrl);

    lockProvider.init({
      clientID: config.clientId,
      domain: config.domainUrl,
      options: {
        _idTokenVerification: false,
        redirectUrl: config.redirectUrl
        // oidcConformant: true,
        /* auth: {
          responseType: 'token',
          params: {
            audience: config.customRulesApiAudience
          }
        } */
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
