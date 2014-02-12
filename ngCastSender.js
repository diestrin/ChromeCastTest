(function (ng) {
  ng
    .module('ngCastSender', [])
    .provider('CastSender', function () {
      ///////////////////////
      // Private variables //
      ///////////////////////

      // Initialize the default media receiver app ID
      var applicationID = null;
      // Define the namespace if any
      var namespace = null;
      // Define the session variable
      var session = null;

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

      /**
       * Handles the initialization success of the SDK
       */
      var onInitSuccess = function () {
        console.log("onInitSuccess");
      };

      /**
       * Handles the session creating for the ChromeCast
       * This means that we have a connection with a ChromeCast device
       * @param  {object} event
       */
      var sessionListener = function (e) {
        console.log('New session ID:' + e.sessionId);
        session = e;

        // Add a listener to any change in this session
        session.addUpdateListener(sessionUpdateListener);

        // Add a listener for any message in the namespace, if any
        if (namespace) {
          session.addMessageListener(namespace, receiverMessage);
        }
      };

      /**
       * Handles any change in the session established with a ChromeCast device
       * @param  {Boolean} isAlive
       */
      var sessionUpdateListener = function (isAlive) {
        var message = isAlive ? 'Session Updated' : 'Session Removed';
        message += ': ' + session.sessionId;
        console.log(message);

        // If the session ended, then remove the session object
        if (!isAlive) {
          session = null;
        }
      };

      /**
       * Handles any message coming from the ChromeCast device
       * @param {string} message
       */
      var receiverMessage = function (message) {
        console.log("receiverMessage: "+namespace+", "+message);
        rootScope.$broadcast('Cast:New:Message', message);
        rootScope.$digest();
      };

      /**
       * Handles the receiver listener event, which means the devices are ready
       * to request a session. The extension handles the list of devices, not
       * the SDK, so the user choose the device from the extension popup, not the app.
       * @param  {object} event
       */
      var receiverListener = function (e) {
        if( e === 'available' ) {
          console.log("receiver found");
          rootScope.$broadcast('Cast:Ready');
        } else {
          console.log("receiver list empty");
          rootScope.$broadcast('Cast:NotReady');
        }
        rootScope.$digest();
      };

      /////////////////////////////
      // Public Provider Methods //
      /////////////////////////////

      /**
       * Setter of the application ID
       * @param  {?string} appId
       */
      this.applicationID = function (appId) {
        applicationID = appId;
      };

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
        broadcast = $rootScope.$broadcast;
        rootScope = $rootScope;

        /**
         * Request a session to a ChromeCast device
         * @return {promise}
         */
        var requestSession = function () {
          var deferred = $q.defer();

          chrome.cast.requestSession(function (e) {
            session = e;
            deferred.resolve(e);
            $rootScope.$digest();
          }, function (message) {
            onError(message);
            deferred.reject(message);
            $rootScope.$digest();
          });

          return deferred.promise;
        };

        return {
          getSession: function () {
            var deferred = $q.defer();

            if (session) {
              deferred.resolve(session);
            } else {
              return requestSession();
            }

            return deferred.promise;
          },
          loadMedia: function (url, mime) {
            var deferred = $q.defer();

            var mediaInfo = new chrome.cast.media.MediaInfo(url, mime);
            var loadRequest = new chrome.cast.media.LoadRequest(mediaInfo);
            session.loadMedia(loadRequest, function (e) {
              deferred.resolve(e);
              $rootScope.$digest();
            }, function (message) {
              onError(message);
              deferred.reject(message);
              $rootScope.$digest();
            });

            return deferred.promise;
          },
          sendMessage: function (message) {
            var deferred = $q.defer();

            session.sendMessage(namespace, message, function (e) {
              deferred.resolve(e);
              $rootScope.$digest();
            }, function () {
              onError(message);
              deferred.reject(message);
              $rootScope.$digest();
            });

            return deferred.promise;
          }
        };
      };
    });
})(angular);
