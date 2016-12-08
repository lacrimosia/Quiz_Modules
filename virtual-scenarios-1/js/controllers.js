'use strict';

angular.module('myApp.controllers', [])

  .controller('AppCtrl', function($scope, $http) {

    $scope.includes = {
      // oeHeader: 'partials/oe-header.html',
      oeFooter: 'partials/oe-footer.html'
    }

    $scope.oeMenu = {
      on: false,
      open: false
    }

    $scope.oeMenuToggle = function(toggle) {
      if(toggle == 'off') {
        $scope.oeMenu.open = false;
      } else {
        $scope.oeMenu.open = !$scope.oeMenu.open;
      }
    }

    $http.get('js/data.json').success(function(data) {
      $scope.data = data;
      $scope.position = function(scenario) {
        return { top: scenario.startPoint.top + '%', left: scenario.startPoint.left + '%'};
      }
    });

    angular.element('#intro-video')

    .bind('ended', function() {
      $scope.config.introVideo = false;
      $scope.$apply();
    })

    .bind('loadeddata', function(){
      if(angular.element('#intro-video')[0].paused){
        $scope.config.introVideo = false;
      }
    });

    $scope.lightbox = true;

    $scope.toggleLightbox = function() {
      if ($scope.lightbox) {
        $scope.lightbox = !$scope.lightbox;
        angular.element('#intro-video')[0].pause();
      }
    }

  })

  .controller('HomeCtrl', function($scope) {

  })

  .controller('OverviewCtrl', function($scope) {

  })

  .controller('ScenarioCtrl', function($scope, $http, $stateParams) {

    $scope.indexer = $stateParams.scenario - 1;

    $http.get('js/data.json').success(function(data) {

      $scope.data = data;

      $scope.scenarios = data.scenarios;

      $scope.scenario = $scope.scenarios[$scope.indexer];

      $scope.position = function(positionTop,positionLeft) {
        return { top: positionTop + '%', left: positionLeft + '%'};
      }

      $scope.currentIndex = 0;
      
      $scope.remaining = function() {
        var count = 0;
        angular.forEach($scope.todos, function(choice) {
          count += choice.done ? 0 : 1;
        });
        return count;
      }

      // scenario question types
      $scope.showIf = function(thisQuestionType, type) {
        if (thisQuestionType == type) {
          return true;
        }
      }

      // object to keep track of correct answers in the current scenario
      $scope.advance = {};

      // sets $scope.advance for "ordering" questions
      $scope.dropCallback = function(event, ui, questionIndex) {
        var count = 0;
        var i;
        for(i=0; i < $scope.scenario.questions[questionIndex].choices.length; i++) {
          if ($scope.scenario.questions[questionIndex].choices[i].title === $scope.scenario.questions[questionIndex].answers[i]) {
            count++;
            if(count === $scope.scenario.questions[questionIndex].choices.length) {
              $scope.scenario.questions[questionIndex].choices.forEach(function(choice) {
                choice.drag = false;
                $scope.advance[$scope.currentIndex] = true;
              });
            }
          }
        }
      }

      // sets $scope.advance for "assign value" questions
      $scope.assignModel = {};
      $scope.assignValue = function(choice, answer, questionIndex, choiceIndex) {
        var rightCount = 0;
        if(choice === answer) {
          if($scope.assignModel[questionIndex + "-" + choiceIndex] === true) {
            $scope.assignModels[questionIndex + "-" + choiceIndex] = false;
          // else toggle true
          } else {
            $scope.assignModel[questionIndex + "-" + choiceIndex] = true;
          }
          // if all correct answers are selected
          for(var property in $scope.assignModel) {
            if($scope.assignModel.hasOwnProperty(property)) {
              if($scope.assignModel[property] === true) {
                rightCount++;
              }
            }
            if((rightCount === $scope.scenario.questions[questionIndex].choices.length)) {
              $scope.advance[$scope.currentIndex] = true;
            } else {
              $scope.advance[$scope.currentIndex] = false;
            }
          }
          return true;
        } else {
          return false;
        }
      }
      $scope.assignClass = function(questionIndex, choiceIndex) {
        if($scope.assignModel[questionIndex + "-" + choiceIndex] === true) {
          return true;
        }
      }

      // object to keep track of correct answers on "radio" and "checkbox" questions
      $scope.switchboard = {};

      // sets 'correct' CSS class for "radio" and "checkbox" questions
      $scope.assignCorrect = function(type, questionIndex, choiceIndex, choice, validity) {
        if(type === "radio") {
          if(choice === $scope.scenario.questions[questionIndex].answers[0]) {
            // returns true and adds the correct class to template
            return true;
          }
        } else if(type === "checkbox") {
          if($scope.scenario.questions[questionIndex].answers.indexOf(choice) > -1) {
            return true;
          }
        }else if(type === "radiosFeedback"){
          if(choice === $scope.scenario.questions[questionIndex].answers[0]) {
            // returns true and adds the correct class to template
           // $scope.getText = $scope.scenario.questions[questionIndex].feedback[choiceIndex];
            return true;
          }
        }else if(type === "textInput") {
          if(validity === true) {
            return true;
          }
        }
      }

      // get the index of the choice
      // assign this value to get the index of the chosen radio button 
      $scope.getIndexChoice = 0;

      // get text
      $scope.getText = "";

      // get Text
      $scope.changeText = function(questionIndex, choiceIndex){
        $scope.getText = $scope.scenario.questions[questionIndex].feedback[choiceIndex];
        return $scope.getText;
      }

      // object to keep track of which checkbox answers have been submitted
      $scope.unveil = {};

      // sets $scope.advance on the current question for "radio," "checkbox," and "text input" questions
      $scope.allowNext = function(type, questionIndex, choiceIndex, choice, validity) {
        // if radio
        if(type === "radio") {
          if(choice === $scope.scenario.questions[questionIndex].answers[0]) {
            $scope.advance[$scope.currentIndex] = true;
          }
        // if radio with the feedback
        }if(type === "radiosFeedback") {
          if(choice === $scope.scenario.questions[questionIndex].answers[0]) {
            $scope.advance[$scope.currentIndex] = true;
          }
        // if checkbox
        } else if(type === "checkbox") {
          $scope.unveil[$scope.currentIndex] = true;
          $scope.advance[$scope.currentIndex] = true;
        // if textInput
        } else if(type === "textInput") {
          $scope.advance[$scope.currentIndex] = true;
        }
      }

      // next/prev question button
      $scope.changeIndex = function(direction) {
        if (direction === 'next') {
          $scope.currentIndex += 1;
          $scope.switchboard = {};
        } else if (direction === 'prev') {
          $scope.currentIndex -= 1;
          $scope.unveil[$scope.currentIndex] = false;
        }
      }

      // disable next button
      $scope.preventAdvance = function(currentIndex, scenarioQuestions) {
        if($scope.scenario != undefined) {
          // if at the end
          if(currentIndex === scenarioQuestions.length) {
            return true;
          }
          // if there is no answer to submit
          if(scenarioQuestions[currentIndex].type === "think") {
            return false;
          }
        }
        // everything else disable
        if(!$scope.advance[currentIndex]) {
          return true;
        }
      }

    });

    $scope.lightbox = -1;

    $scope.toggleLightbox = function(index) {
      if ($scope.lightbox != index) {
        $scope.lightbox = index;
      } else {
        $scope.lightbox = -1;
      }
    }

  });