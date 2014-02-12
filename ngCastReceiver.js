(function (ng) {
  ng
    .module('ngCastReceiver', [])
    .provider('CastReceiver', function () {
      ///////////////////////
      // Private variables //
      ///////////////////////

      // Define the namespace if any
      var namespace = null;

      var rootScope = null;

      /////////////////////
      // Private methods //
      /////////////////////

      /**
       * Initialize the ChromeCast configuration
       */
      var init = function () {
        var sessionRequest = new chrome.cast.SessionRequest(applicationID || chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
        var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
          sessionListener,
          receiverListener);

        chrome.cast.initialize(apiConfig, onInitSuccess, onError);
      };

      /**
       * Handles any error in the API
       * @param  {object} message
       */
      var onError = function (message) {
        console.log("onError: " + JSON.stringify(message));
      };


      /////////////////////////////
      // Public Provider Methods //
      /////////////////////////////

      /**
       * Setter of the namespace
       * @param  {string} nmSpace
       */
      this.namespace = function (nmSpace) {
        namespace = nmSpace;
      };

      /**
       * Public init method
       */
      this.init = function () {
        if (!chrome.cast || !chrome.cast.isAvailable) {
          setTimeout(init, 1000);
        } else {
          init();
        }
      };

      ////////////////////////////
      // Public Service Methods //
      ////////////////////////////

      this.$get = function ($rootScope, $q) {
        rootScope = $rootScope;

        return {
          sendMessage: function (message, senderId) {
            session.sendMessage(namespace, message, function (e) {
              deferred.resolve(e);
              $rootScope.$digest();
            }, function () {
              onError(message);
              deferred.reject(message);
              $rootScope.$digest();
            });
          }
        };
      };
    });
})(angular);
