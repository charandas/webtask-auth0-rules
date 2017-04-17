import map from 'lodash/map';

import tpl from './dashboard.html!text';

function DashboardController (authService, $scope, $filter, $interval, LxDataTableService, rulesContextService) {
  'ngInject';
  const vm = this;
  function init (rulesContext) {
    vm.authService = authService;
    vm.rulesContext = map(rulesContext, rule => {
      return Object.assign({}, rule, {
        ruleIds: map(rule.rules, 'ruleId'),
        ruleScripts: map(rule.rules, 'script')
      });
    });

    vm.rulesContextHeader = [
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
  }

  function reloadRules () {
    LxDataTableService.unselectAll('rules');
    vm.isLoading = rulesContextService
      .get()
      .then(init)
      .catch(error => {
        console.log(error);
        // Try once more, in case the session needed to be renewed
        return rulesContextService
          .get()
          .then(init);
      });
    return vm.isLoading;
  }

  function selectedAction (_event, _dataTableId, _selectedRows) {
    if (_dataTableId === 'rules') {
      vm.selectedRows = _selectedRows;
    }
  }

  function updateSort (_event, _dataTableId, _column) {
    if (_dataTableId === 'rules') {
      vm.rulesContext = $filter('orderBy')(vm.rulesContext, _column.name, _column.sort === 'desc');
    }
  }

  $scope.$on('lx-data-table__selected', selectedAction);
  $scope.$on('lx-data-table__unselected', selectedAction);
  $scope.$on('lx-data-table__sorted', updateSort);

  vm.reloadRules = reloadRules;
  reloadRules();
}

const dashboardComponent = {
  template: tpl,
  controller: DashboardController,
  transclude: true
};

export default dashboardComponent;
