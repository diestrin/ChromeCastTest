(function (ng) {
  ng
    .module('Test1', ['ngCastSender'])
    .config(function (CastSenderProvider) {
      CastSenderProvider.applicationID('');
      CastSenderProvider.namespace('urn:x-cast:com.diegobarahona.cast.sample.geekhour.test2');
      CastSenderProvider.init();
    })
    .controller('MainCtrl', function ($scope, CastSender, $http) {
      $scope.$on('Cast:Ready', function () {
        CastSender.getSession()
        .then(function () {
          return $http.get('https://graph.facebook.com/234675973280120?fields=feed&method=GET&format=json&suppress_http_code=1&access_token=CAACEdEose0cBAPj7X6r3G6GQmhpNADmjMP0ODN9IZC2qT3wGlji4qhgbRVNmMvXOG30ZAh4DR6Il8mr7w16yfQIaZCO5LKLNuX5at8TJIp8KO3Ks9Dqo2gIK9TKlvj3JqPhBqcZC460c2DqqAVcHXZBgmb8XBlzAZAnWgZBZAfAGwV2yOIB6iTRFL97VgbJ7S1oZD');
        })
        .then(function (data) {
          console.log(data);
        });
      });
    });
})(angular);
