import map from 'lodash/map';
import axios from './axios';
import get from 'lodash/get';
import config from 'webtask-auth0-rules/config.json!json';

function getRulesContext () {
  const bearerToken = window.localStorage.getItem('access_token');
  axios.defaults.headers.common['Authorization'] = `Bearer ${bearerToken}`;
  return axios
    .get('/api/rules')
    .then(response => get(response, 'data'))
    .catch(error => console.log(error));
}

export default function DashboardController (authService, $scope, $filter, $interval, LxDataTableService) {
  'ngInject';
  const vm = this;

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
  };

  this.isLoading = undefined;

  this.reloadRules = () => {
    LxDataTableService.unselectAll('rules');
    this.selectedRows = [];
    this.isLoading = getRulesContext()
      .then(init);
  };

  this.reloadRules();

  const refreshInterval = get(config, 'dashboard.refreshInterval');
  const reloadTask = $interval(this.reloadRules, refreshInterval * 1000);

  this.refreshInterval = refreshInterval;

  $scope.$on('$destroy', () => {
    $interval.cancel(reloadTask);
  });
}
