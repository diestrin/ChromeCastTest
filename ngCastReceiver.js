(function (ng) {
  ng
    .module('ngCastReceiver', [])
    .provider('CastReceiver', function () {
      ///////////////////////
      // Private variables //
      ///////////////////////

      // Define the namespace if any
      var namespace = null;
      // Define the receiverManager
      var castReceiverManager = null;
      // Define the message bus
      var messageBus = null;

      var rootScope = null;

      /////////////////////
      // Private methods //
      /////////////////////

      /**
       * Initialize the ChromeCast configuration
       */
      var init = function () {
        cast.receiver.logger.setLevelValue(0);

        // Get the receiver instance
        castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
        castReceiverManager.onReady = onReceiverReady;
        castReceiverManager.onSenderConnected = onNewSender;
        castReceiverManager.onSenderDisconnected = onSenderLeave;
        castReceiverManager.onSystemVolumeChanged = onVolumeChange;

        // Get the message bus if there's a namespace
        if (namespace) {
          messageBus = castReceiverManager.getCastMessageBus(namespace);
          messageBus.onMessage = onNewMessage;
        }

        castReceiverManager.start({statusText: "Application is starting"});
        console.log('Receiver Manager started');
      };

      /**
       * Handles any error in the API
       * @param  {object} message
       */
      var onError = function (message) {
        console.log("onError: " + JSON.stringify(message));
      };

      /**
       * Handles the ready event of the receiver
       * @param  {object} event
       */
      var onReceiverReady = function (event) {
        console.log('Received Ready event: ' + JSON.stringify(event.data));
        castReceiverManager.setApplicationState("Application status is ready.");

        rootScope.$broadcast('Cast:Ready', newSender);
        rootScope.$digest();
      };

      /**
       * Handles the connection of a new sender
       * @param  {object} event
       */
      var onNewSender = function (event) {
        var newSender = castReceiverManager.getSender(event.data);

        console.log('Received Sender Connected event: ' + event.data);
        console.log(newSender.userAgent);

        rootScope.$broadcast('Cast:New:Sender', newSender);
        rootScope.$digest();
      };

      /**
       * Handles the sender disconnection event
       * @param  {object} event
       */
      var onSenderLeave = function (event) {
        console.log('Received Sender Disconnected event: ' + event.data);

        // If there's no more senders, then close the app
        if (castReceiverManager.getSenders().length === 0) {
          window.close();
        }
      };

      /**
       * Handles the volume change event
       * @param  {object} event
       */
      var onVolumeChange = function (event) {
        console.log([
          'Received System Volume Changed event:',
          event.data['level'],
          event.data['muted']
        ].join(' '));
      };

      var onNewMessage = function (event) {
        var message = event.data;
        var senderId = event.senderId;

        console.log('Message [' + senderId + ']: ' + message);

        rootScope.$broadcast('Cast:New:Message', message, senderId);
        rootScope.$digest();
      };

      var sendMessage = function (message, senderId, onSuccess, onError) {
        if (senderId) {
          messageBus.send(senderId, message, onSuccess, onError);
        } else {
          message.broadcast(message, onSuccess, onError);
        }
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
        if (!cast || !cast.receiver) {
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
            var deferred = $q.defer();
            senderId = senderId || false;

            sendMessage(message, senderId, function (e) {
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
