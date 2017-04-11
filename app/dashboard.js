import map from 'lodash/map';

export default function DashboardController (rulesContext, $scope, $filter) {
  'ngInject';
  const vm = this;
  this.rulesContext = map(rulesContext, rule => {
    return Object.assign({}, rule, {
      ruleIds: rule.rules.length ? map(rule.rules, 'ruleId') : 'No Rules!',
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
      label: 'Rule IDs',
      sortable: false
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
}
