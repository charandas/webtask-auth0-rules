import get from 'lodash/get';
import config from 'webtask-auth0-rules/config.json!json';
import tpl from './scheduleRefresh.html!text';

function ScheduleRefreshController ($interval, $scope) {
  'ngInject';
  let reloadTask;
  let timerTask;
  const refreshInterval = get(config, 'dashboard.refreshInterval');
  const vm = this;
  vm.refreshInterval = refreshInterval;

  function selectedAction (_event, _dataTableId, _selectedRows) {
    // this is within the current data that is loaded
    if (_dataTableId === 'rules') {
      if (!vm.disableRefresh && _selectedRows.length === 0) {
        turnOn(vm.parent.reloadRules, refreshInterval);
      } else {
        turnOff();
      }
    }
  }

  function registerDataTableEvents () {
    $scope.$on('lx-data-table__selected', selectedAction);
    $scope.$on('lx-data-table__unselected', selectedAction);
  }

  // Idempotent call: if already scheduled, nothing is done
  function turnOn (reloadRules, refreshInterval) {
    if (!reloadTask) { // same as !vm.disableRefresh, however it guarantees idempotency
      showTimer(refreshInterval); // only for the first instance of timer
      reloadTask = $interval(() => {
        hideTimer(); // to cancel previous run in case we finished early
        showTimer(refreshInterval);
        vm
          .parent
          .reloadRules();
      }, refreshInterval * 1000);
    }
  }

  function turnOff () {
    if (reloadTask) {
      $interval.cancel(reloadTask);
    }
    reloadTask = undefined;
    hideTimer();
  }

  // Idempotent call: if already scheduled, nothing is done
  function showTimer (refreshInterval) {
    if (timerTask) {
      return;
    }

    vm.hideTimer = false;
    vm.determinateCircularProgressValue = 0;

    timerTask = $interval(function () {
      if (vm.determinateCircularProgressValue < 100) {
        vm.determinateCircularProgressValue += (100 / refreshInterval);
      } else {
        $interval.cancel(timerTask);
        timerTask = undefined;
      }
    }, 1000);
  }

  function hideTimer () {
    vm.hideTimer = true;
    if (timerTask) {
      $interval.cancel(timerTask);
      timerTask = undefined;
    }
  }

  vm.disableRefresh = false;
  vm.toggleAutoRefresh = () => {
    vm.disableRefresh = !vm.disableRefresh;
    if (vm.disableRefresh) {
      turnOff();
    } else {
      turnOn(vm.parent.reloadRules, refreshInterval);
    }
  };

  vm.$onInit = function () {
    turnOn(vm.parent.reloadRules, refreshInterval);
    registerDataTableEvents();
  };
}

const scheduleRefreshComponent = {
  template: tpl,
  controller: ScheduleRefreshController,
  require: {
    parent: '^dashboard'
  }
};

export default scheduleRefreshComponent;
