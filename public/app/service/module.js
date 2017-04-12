import angular from 'angular';
import 'auth0/lock';
import 'auth0-js';
import 'angular-lock';
import 'angular-jwt';

import authService from './authService';

const module = angular
  .module('webtask-auth0-rules.services', ['auth0.lock', 'angular-jwt'])
  .factory('authService', authService);

export default module.name;
