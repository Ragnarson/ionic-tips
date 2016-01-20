angular.module('app', ['ionic'])

// 1
angular.module('app')
.run(function($ionicPlatform, $timeout) {
  $ionicPlatform.ready(function() {
    if(window.cordova) {
       $timeout(function() {
          navigator.splashscreen.hide()
       } , 500);
    }
  });
});

// 2
angular.module('app')
.factory('Navigator', function($state, $ionicHistory, $ionicViewSwitcher) {
  return {
    go: function(stateName, opts) {
      if (opts == null) {
        opts = {
          stateParams: {},
          noBack: false,
          animation: 'forward'
        };
      }
      $ionicViewSwitcher.nextDirection(opts.animation);
      $state.go(stateName, opts.stateParams);
      if (opts.noBack) {
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
      }
    },
    goBack: function() {
      $ionicHistory.goBack();
    },
    current: function() {
      return $state.current.name;
    }
  };
});

// 3
angular.module('app')
.directive('defaultNavBackButton', function ($ionicHistory, $state, $stateParams, $ionicConfig, $ionicViewSwitcher, $ionicPlatform) {
  return {
    link: link,
    restrict: 'EA'
  };

  function link(scope, element, attrs) {
    scope.backTitle = function() {
      var defaultBack = getDefaultBack();
      if ($ionicConfig.backButton.previousTitleText() && defaultBack) {
        return $ionicHistory.backTitle() || defaultBack.title;
      }
    };

    scope.goBack = function() {
      if ($ionicHistory.backView()) {
        $ionicHistory.goBack();
      } else {
        goDefaultBack();
      }
    };

    scope.$on('$stateChangeSuccess', function() {
      element.toggleClass('hide', !getDefaultBack());
    });

    $ionicPlatform.registerBackButtonAction(function () {
        if ($ionicHistory.backView()) {
          $ionicHistory.goBack();
        } else if(getDefaultBack()) {
          goDefaultBack();
        } else {
          navigator.app.exitApp();
        }
    }, 100);
  }

  function getDefaultBack() {
    return ($state.current || {}).defaultBack;
  }

  function goDefaultBack() {
    $ionicViewSwitcher.nextDirection('back');
    $ionicHistory.nextViewOptions({
      disableBack: true,
      historyRoot: true
    });

    var params = {};

    if (getDefaultBack().getStateParams) {
      params = getDefaultBack().getStateParams($stateParams);
    }

    $state.go(getDefaultBack().state, params);
  }
});

angular.module('app')
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('hello', {
    url: '/?name',
    templateUrl: 'views/hello.html',
    controller: 'HelloCtrl'
  }).state('about', {
    url: '/about',
    templateUrl: 'views/about.html',
    controller: 'AboutCtrl',
    defaultBack: {
      state: 'hello',
      getStateParams: function() {
        return {
          name: "guest"
        };
      }
    }
  })

  $urlRouterProvider.otherwise('/');
});

angular.module('app')
.controller("HelloCtrl", function($scope, $stateParams, Navigator) {
  $scope.name = $stateParams.name
  $scope.goToAbout = function() {
    Navigator.go('about');
  };
});

angular.module('app')
.controller("AboutCtrl", function($scope) {
});

// 4

angular.module('app')
.factory('Api', function($http) {
  var default_opts = {
    cache: false,
    timeout: 5 * 1000,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };
  var api_host = window['Settings'].API_HOST;
  return {
    get: function(uri, opts) {
      return $http.get(api_host + uri, _.merge(default_opts, (opts || {})));
    },
    put: function(uri, params, opts) {
      return $http.put(api_host + uri, params, _.merge(default_opts, (opts || {})));
    },
    post: function(uri, params, opts) {
      return $http.post(api_host + uri, params, _.merge(default_opts, (opts || {})));
    }
  };
});

angular.module('app')
.config(function($provide, $httpProvider) {
  $provide.factory('timeoutHandler', function($q, $injector) {
    var isTimeout = function(rejection) {
      return rejection.status === 0;
    };
    return {
      responseError: function(rejection) {
        if(isTimeout(rejection)) {
          $injector.invoke(function($ionicPopup) {
            $ionicPopup.alert({
              title: 'Timeout',
              template: 'Connection timeout'
            });
          });
        }
        $q.reject(rejection);
      }
    }
  });
  $httpProvider.interceptors.push('timeoutHandler');
});

// 7
angular.module('app')
.config(function($provide) {
  return $provide.decorator('$exceptionHandler', function($delegate) {
    return function(exception, cause) {
      var initInjector = angular.injector(['ng']);
      $http = initInjector.get('$http');
      var params = {
        message: exception.message,
        cause: cause,
        stack: exception.stack
      };
      $http.post(window['Settings'].API_HOST + '/js_errors.json', params)
      $delegate(exception, cause);
    };
  });
});

angular.module('app')
.config(function($compileProvider) {
  $compileProvider.debugInfoEnabled(false);
});


