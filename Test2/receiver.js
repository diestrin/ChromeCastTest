(function (ng) {
  ng
    .module('Test1', ['ngCastReceiver'])
    .config(function (CastReceiverProvider) {
      CastReceiverProvider.namespace('urn:x-cast:com.diegobarahona.cast.sample.geekhour.test2');
      CastReceiverProvider.init();
    })
    .controller('MainCtrl', function ($scope, CastReceiver) {
      $scope.$on('Cast:New:Message', function (e, posts) {
        $scope.posts = JSON.parse(posts);
      });
    });
})(angular);
