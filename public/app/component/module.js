import angular from 'angular';

import rulesContextService from './rulesContextService';
import dashboardComponent from './dashboard';
import scheduleRefreshComponent from './scheduleRefresh';

const module = angular
  .module('webtask-auth0-rules.components', [])
  .component('scheduleRefresh', scheduleRefreshComponent)
  .component('dashboard', dashboardComponent)
  .factory('rulesContextService', rulesContextService);

export default module.name;
