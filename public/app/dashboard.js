import map from 'lodash/map';
import get from 'lodash/get';
import Bluebird from 'bluebird';
import auth0 from 'auth0-js';
import config from 'webtask-auth0-rules/config.json!json';

import axios from './axios';

const webAuth = Bluebird.promisifyAll(new auth0.WebAuth({
  clientID: config.clientId,
  domain: config.domainUrl,
  redirectUri: config.redirectUrl,
  responseType: 'id_token token',
  responseMode: 'fragment',
  scope: 'openid',
  audience: config.customRulesApiAudience
}));

export default function DashboardController (authService, $scope, $filter, $interval, LxDataTableService) {
  'ngInject';
  const vm = this;

  function renewTokens () {
    return webAuth
      .renewAuthAsync({
        // Definitely had to use false, otherwise IFrame handler timesout in auth0-js
        usePostMessage: false
      });
  }

  function getRulesContext (reloadTask) {
    const bearerToken = window.localStorage.getItem('access_token');
    return axios
      .get('/api/rules', {
        headers: {
          'Authorization': `Bearer ${bearerToken}`
        }
      })
      .then(response => get(response, 'data'))
      .catch(error => {
        console.log(error);
        if (error.response.status === 401) {
          return renewTokens()
            .then(() => {
              // with the difference that the recurring task lives
              throw error;
            });
        }
        $interval.cancel(reloadTask);
        throw error;
      });
  }

  const init = (rulesContext) => {
    this.authService = authService;
    this.rulesContext = map(rulesContext, rule => {
      return Object.assign({}, rule, {
        ruleIds: `${rule.rules.length} Rules`,
        ruleScripts: map(rule.rules, 'script')
      });
    });

    this.rulesContextHeader = [
      {
        name: 'clientId',
        label: 'Client ID'
      },
      {
        name: 'clientName',
        label: 'Client Name',
        sortable: true,
        sort: 'asc'
      },
      {
        name: 'ruleIds',
        label: 'Rules',
        sortable: true
      }
    ];

    $scope.$on('lx-data-table__selected', updateActions);
    $scope.$on('lx-data-table__unselected', updateActions);
    $scope.$on('lx-data-table__sorted', updateSort);

    function updateActions (_event, _dataTableId, _selectedRows) {
      if (_dataTableId === 'rules') {
        vm.selectedRows = _selectedRows;
      }
    }

    function updateSort (_event, _dataTableId, _column) {
      vm.rulesContext = $filter('orderBy')(vm.rulesContext, _column.name, _column.sort === 'desc');
    }

    vm.hideTimer = false;
  };

  this.isLoading = undefined;

  // Need to have reloadTask closured in for reloadRules()
  // Otherwise, there is a chicken-in-the-egg problem
  let reloadTask;
  const refreshInterval = get(config, 'dashboard.refreshInterval');
  this.reloadRules = () => {
    this.hideTimer = true;
    LxDataTableService.unselectAll('rules');
    this.selectedRows = [];
    this.isLoading = getRulesContext(reloadTask)
      .then(init)
      .catch(() => {
        // Try once more, in case the session needed to be renewed
        return getRulesContext(reloadTask)
          .then(init);
      });
  };
  reloadTask = $interval(this.reloadRules, refreshInterval * 1000);

  this.reloadRules();

  this.refreshInterval = refreshInterval;

  $scope.$on('$destroy', () => {
    $interval.cancel(reloadTask);
  });
}
