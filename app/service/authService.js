export default function authService ($q, $rootScope, $state, lock, authManager) {
  'ngInject';

  // Fix this event handler
  $rootScope.$on('$stateChangeStart', function (event, nextState) {
    $rootScope.isAuthenticated = authManager.isAuthenticated();
    if (nextState.name === 'dashboard') {
      if (!authManager.isAuthenticated()) {
        $state.go('login');
        event.preventDefault();
      }
    }

    if (nextState.name === 'login') {
      if (authManager.isAuthenticated()) {
        $state.go('dashboard');
        event.preventDefault();
      }
    }
  });

  function login () {
    lock.show();
  }

  // Set up the logic for when a user authenticates
  // This method is called from app.run.js
  function registerAuthenticationListener () {
    console.log('Setting up listener');
    lock.on('authenticated', function (authResult) {
      $rootScope.isAuthenticated = true;
      window.localStorage.setItem('id_token', authResult.idToken);
      authManager.authenticate();
    });

    lock.on('authorization_error', function (err) {
      console.log(err);
    });
  }

  function logout () {
    $rootScope.isAuthenticated = false;
    window.localStorage.removeItem('id_token');
    authManager.unauthenticate();
    $state.go('login');
  }

  return {
    login,
    registerAuthenticationListener,
    logout
  };
}
