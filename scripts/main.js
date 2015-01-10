var INTERVAL = 30*1000; // in seconds
var SNOOZE = 1*60*1000; // in minutes

document.addEventListener("deviceready", onDeviceReady, false);

function id(element) {
	return document.getElementById(element);
}

function onDeviceReady() {
    aler('DeviceReady');
	// navigator.splashscreen.hide();
	var notificationApp = new NotificationApp();
	notificationApp.run();
}

function NotificationApp() {
}

NotificationApp.prototype = {

	snoozedFor: 0,

	run: function () {
		var self = this;
		self._checkTemp();
		// Set periodic check
		$(function(){
			var ticker = setInterval(function() {
				self._checkTemp.apply(self);
			}, INTERVAL);

		});

		id("snoozeButton").addEventListener("click", function () {
			// TODO: Snooze
			var snooze = parseInt($('#snooze').val());
			navigator.notification.alert('Snoozed for ' + snooze + ' min',
				function () {
					self.snoozedFor = snooze*60*1000;
				},
				'Alert',
				'OK'
			);
		});
	},

	_checkTemp: function () {
		var self = this;
		$.getJSON('http://tiger.uk.to:8088/api', function(data) {
			if (data && data['temp']) {
				var temp = data['temp'];
				var colorClass = data['cls'] ? data['cls'] : '';
				$('#temp').text(data['temp'].toFixed(2)).attr('class', colorClass);
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
