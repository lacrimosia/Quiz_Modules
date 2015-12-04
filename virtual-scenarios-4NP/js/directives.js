'use strict';

angular.module('myApp.directives', [])

  // check z-index of mobilecheck class to determine the size of the viewport
  .directive("mobileCheck", function() {
    return {
      link: function (scope, element, attrs) {
        scope.getZIndex = function() {
          return window.getComputedStyle(element[0]).getPropertyValue('z-index')
        }
        scope.$watch(scope.getZIndex, function(newValue, oldValue) {
          if(newValue != 1 && scope.oeMenu.open){
            scope.oeMenuToggle();
          }
        });
        window.onresize = function(){
          scope.$apply();
        }
      }
    }
  });