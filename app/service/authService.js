export default function authService ($q, $rootScope, $state, lock, authManager) {
  'ngInject';

  $rootScope.$on('$stateChangeStart', function (event, nextState) {
    if (nextState.name !== 'login' && !authManager.isAuthenticated()) {
      $state.go('login');
      event.preventDefault();
    } else if (nextState.name === 'login' && authManager.isAuthenticated()) {
      $state.go('dashboard');
      event.preventDefault();
    }
  });

  function login () {
    delete $rootScope.loginError;
    lock.show();
  }

  function registerAuthenticationListener () {
    lock.on('authenticated', function (authResult) {
      $rootScope.isAuthenticated = true;
      window.localStorage.setItem('access_token', authResult.accessToken);
      window.localStorage.setItem('id_token', authResult.idToken);
      authManager.authenticate();
    });

    lock.on('authorization_error', function (err) {
      $rootScope.loginError = err;
      console.log(err);
    });
  }

  function logout () {
    $rootScope.isAuthenticated = false;
    window.localStorage.removeItem('id_token');
    window.localStorage.removeItem('access_token');
    authManager.unauthenticate();
    $state.go('login');
  }

  return {
    login,
    registerAuthenticationListener,
    logout
  };
}
