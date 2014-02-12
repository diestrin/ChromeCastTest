(function (ng) {
  ng
    .module('Test1', ['ngCastSender'])
    .config(function (CastSenderProvider) {
      CastSenderProvider.init();
    })
    .controller('MainCtrl', function ($scope, CastSender, $interval) {
      var index = 0;
      var gallery = [
        'http://www.jeancocteaucinema.com/wp-content/uploads/2014/01/game-of-thrones-season-4.jpg',
        'http://static.eclypsia.com/public/upload/cke/Games/Game%20of%20Thrones/thumb_game-of-thrones-003.flv.jpg',
        'http://s1.bwallpapers.com/wallpapers/2014/01/16/game-of-thrones-desktop-background_091725.jpg'
      ];

      $scope.$on('Cast:Ready', function () {
        CastSender.getSession()
        .then(function () {
          $interval(function () {
            CastSender.loadMedia(gallery[index++], 'image/jpeg');

            if (index === gallery.length) {
              index = 0;
            }
          }, 5000);
        });
      });
    });
})(angular);
