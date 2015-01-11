var URL = 'http://tiger.uk.to:8088/api';
var INTERVAL = 30*1000; // in seconds

var app = {

    snoozedFor: 0,

    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
        app.run.apply(app);
    },

    run: function() {
        var self = this;
        this._checkTemp();
        // Set up background mode
        cordova.plugins.backgroundMode.setDefaults({ text:'Doing heavy tasks.'});
        cordova.plugins.backgroundMode.enable();

        // Called when background mode has been activated
        cordova.plugins.backgroundMode.onactivate = function () {
            setTimeout(function () {
                // Modify the currently displayed notification
                cordova.plugins.backgroundMode.configure({
                    text:'Running in background for more than 5s now.'
                });
            }, 5000);
        };

        // document ready
        $(function(){
            setInterval(function() {
                self._checkTemp.apply(self);
            }, INTERVAL);

            $('#snoozeButton').click(function () {
                var snooze = parseInt($('#snooze').val());
                navigator.notification.alert('Snoozed for ' + snooze + ' min',
                    function () {
                        self.snoozedFor = snooze*60*1000;
                    },
                    'Alert',
                    'OK'
                );
            });

            $('#exit').click(function() {
               navigator.app.exitApp();
            });
        });

    },

    _checkTemp: function () {
        var self = this;
        $.getJSON(URL, function(data) {
            if (data && data['temp']) {
                var temp = data['temp'];
                var colorClass = data['cls'] ? data['cls'] : '';
                $('#temp').text(data['temp'].toFixed(2)).parent().attr('class', colorClass);
                if (self.snoozedFor > 0) {
                    // Do not check if snoozed
                    self.snoozedFor -= INTERVAL;
                } else {
                    if (colorClass == 'alert') {
                        self._vibrate();
                        self._playBeep(3);
                    }
                }
            }
        });
    },

    _playBeep: function (count) {
        navigator.notification.beep(count);
    },

    _vibrate: function () {
        navigator.notification.vibrate(300);
        setTimeout(function() {
            navigator.notification.vibrate(200);
        }, 300);
    }
};
