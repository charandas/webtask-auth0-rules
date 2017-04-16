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

  function getRulesContext () {
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
        vm.cancelReloadTask();
        throw error;
      });
  }

  const init = (rulesContext) => {
    this.authService = authService;
    this.rulesContext = map(rulesContext, rule => {
      return Object.assign({}, rule, {
        ruleIds: map(rule.rules, 'ruleId'),
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
        sortable: true,
        format: (row) => {
          return `${row.rules.length} Rules`;
        }
      }
    ];
  };

  $scope.$on('lx-data-table__selected', selectedAction);
  $scope.$on('lx-data-table__unselected', selectedAction);
  $scope.$on('lx-data-table__sorted', updateSort);

  function selectedAction (_event, _dataTableId, _selectedRows) {
    // this is within the current data that is loaded
    if (_dataTableId === 'rules') {
      if (!vm.disableRefresh && _selectedRows.length === 0) {
        vm.scheduleReloadTask();
      } else {
        vm.cancelReloadTask();
      }
      vm.selectedRows = _selectedRows;
    }
  }

  function updateSort (_event, _dataTableId, _column) {
    vm.rulesContext = $filter('orderBy')(vm.rulesContext, _column.name, _column.sort === 'desc');
  }

  this.disableRefresh = false;
  this.toggleAutoRefresh = () => {
    this.disableRefresh = !this.disableRefresh;
    if (this.disableRefresh) {
      this.cancelReloadTask();
    } else {
      this.scheduleReloadTask();
    }
  };
  this.isLoading = undefined;

  function reloadRules () {
    LxDataTableService.unselectAll('rules');
    // this.selectedRows = []
    vm.isLoading = getRulesContext()
      .then(init)
      .catch(error => {
        console.log(error);
        // Try once more, in case the session needed to be renewed
        return getRulesContext()
          .then(init);
      });
  }

  this.reloadRules = reloadRules;

  /*
   * EVERYTHING RELATED TO AUTO REFRESH
   */
  const refreshInterval = get(config, 'dashboard.refreshInterval');
  let reloadTask;
  let timerTask;
  let recurringTimerTask;
  // reloadTask closured in below function
  // Idempotent call: if already scheduled, nothing is done
  this.scheduleReloadTask = () => {
    if (!reloadTask) { // same as !this.disableRefresh
      showTimer();
      reloadTask = $interval(reloadRules, refreshInterval * 1000);
      recurringTimerTask = $interval(showTimer, refreshInterval * 1000);
    }
  };

  reloadRules();
  this.scheduleReloadTask();

  // reloadTask closured in below function
  this.cancelReloadTask = () => {
    this.hideTimer = true;
    if (reloadTask) {
      $interval.cancel(reloadTask);
    }
    if (recurringTimerTask) {
      $interval.cancel(recurringTimerTask);
    }
    if (timerTask) {
      $interval.cancel(timerTask);
    }
    reloadTask = undefined;
    recurringTimerTask = undefined;
    timerTask = undefined;
  };

  this.refreshInterval = refreshInterval;

  $scope.$on('$destroy', () => {
    this.cancelReloadTask();
  });

  function showTimer () {
    vm.hideTimer = false;
    vm.determinateCircularProgressValue = 0;

    timerTask = $interval(function () {
      if (vm.determinateCircularProgressValue < 100) {
        vm.determinateCircularProgressValue += (100 / refreshInterval);
      } else {
        $interval.cancel(timerTask);
      }
    }, 1000);
  }
}
