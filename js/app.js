'use strict';

/* App Module */

var identityApp = angular.module('identityApp', [
  'ngRoute',
  'ngCookies',
  'angularLocalStorage',
  'ngAnimate',
  'identityAnimations',
  'identityServices',
  'identityControllers',
  'identityFilters',
  'checklist-model',
  'ui.bootstrap',
  'ui.bootstrap.datetimepicker'
]);

identityApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/identities', {
        templateUrl: 'partials/identity-list.html',
        controller: 'IdentityListCtrl'
      }).
      when('/identities/:identityId', {
        templateUrl: 'partials/identity-detail.html',
        controller: 'IdentityDetailCtrl'
      }).
      when('/login', {
        templateUrl: 'partials/identity-login.html',
        controller: 'LoginListCtrl'
      }).
      when('/login/:identityId', {
        templateUrl: 'partials/identity-login-detail.html',
        controller: 'IdentityDetailCtrl'
      }).
      otherwise({
        redirectTo: '/identities'
      });
  }]);

identityApp.config(['$httpProvider',
  function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  }
  ]);

identityApp.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});
