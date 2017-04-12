export default function CallbackController ($location) {
  'ngInject';
  console.log('In callback');
  $location.path('/dashboard');
}
