'use strict';

angular.module('myApp', [
  'myApp.controllers',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'ui.router',
  'ngDragDrop'
])

  .run(
    [ '$rootScope', '$http', '$state', '$stateParams',
      function ($rootScope, $http, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.copyright = new Date().getFullYear();
        $http.get('js/data.json').success(function(data) {
          $state.appTitle = data.appTitle;
          $state.coursePrefix = data.coursePrefix;
          $state.courseNumber = data.courseNumber;
        });
      }
    ]
  )

  .config(function($stateProvider, $urlRouterProvider) {

    $stateProvider

      .state("Home", {
        url: "/",
        templateUrl: 'partials/home.html',
        controller: 'HomeCtrl'
      })

      .state('Overview', {
        url: '/overview',
        templateUrl: 'partials/overview.html',
        controller: 'OverviewCtrl'
      })

      .state('Scenario', {
        url: '/overview/scenario',
        templateUrl: 'partials/scenario.html',
        controller: 'ScenarioCtrl'
      })

      .state('Scenario.Detail', {
        url: '/:scenario',
        templateUrl: 'partials/scenario.detail.html',
        controller: 'ScenarioCtrl'
      })

    $urlRouterProvider.otherwise('/');

  });