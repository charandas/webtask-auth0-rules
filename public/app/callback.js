export default function CallbackController ($state, $rootScope) {
  'ngInject';
  if ($rootScope.loginError) {    
    $state.go('login', {}, { replace: true });
  } else {
    $state.go('dashboard', {}, { replace: true });
  }
}
