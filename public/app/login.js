export default function LoginController ($rootScope) {
  'ngInject';
  const loginError = $rootScope.loginError;
  if (loginError) {
    this.error = loginError.error;
    this.errorDescription = loginError.errorDescription;
  }
}
