(function (ng) {
  ng
    .module('Test1', ['ngCastSender'])
    .config(function (CastSenderProvider) {
      CastSenderProvider.applicationID('767A6178');
      CastSenderProvider.namespace('urn:x-cast:com.diegobarahona.cast.sample.geekhour.test2');
      CastSenderProvider.init();
    })
    .controller('MainCtrl', function ($scope, CastSender, $http) {
      $scope.$on('Cast:Ready', function () {
        CastSender.getSession()
        .then(function () {
          return $http.get('https://graph.facebook.com/234675973280120?fields=feed&method=GET&format=json&suppress_http_code=1&access_token=CAACEdEose0cBALbpx3vyDh0xRgs6DeGyhyHrn6ZCsaDZCsFjyIpuip3SDEb19N1P5uB4w7tvAF7ZATNztvynEZBD0QUfKVaNxZCIuGLw3ZAPZBbA7DBGlzdTX1hSdzQVq8JS1EQ7ji8ZAtkQZC31RmRs7RGizIUT9Jjh3ZBuOS6EYu7DnSUY4lt3geTBvo86S2DOcZD');
        })
        .then(function (response) {
          return CastSender.sendMessage(response.data.feed.data);
        })
        .then(function () {
          console.log('Data sent');
        });
      });
    });
})(angular);
