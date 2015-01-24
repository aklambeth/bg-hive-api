var request = require('request');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var ClimateControl = require('./climateControl');
var HotWaterControl = require('./hotwaterControl');

module.exports = Hubs;

function Hubs(context, hubId) {
    this.context = context;
    this.context.id = hubId;
}

util.inherits(Hubs, EventEmitter);

Hubs.prototype.FindController = function() {

    var self = this;
    var uri = this.context.uri + 'users/' + this.context.username + "/hubs/" + this.context.id + '/devices/HAHVACThermostatSLR2/only';
    var options = {
        url:uri,
        headers:{'User-Agent': 'bg-hive-api/0.1.0'},
        jar:this.context.authToken,
        method: 'GET'
    };

    if (!this.context.controller) {

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var deviceId = JSON.parse(body);
                self.context.controller = deviceId.id;
                self.emit('complete', self.GetControllers());
            }
            else {
                console.log(response.statusCode + ' - ' + uri);
            }
        });

    }
    else {
        self.emit('complete', self.GetControllers());
    }
}

Hubs.prototype.GetControllers = function() {

    var heatingController = new ClimateControl(this.context);
    var hotwaterController = new HotWaterControl(this.context);

    return {
        HeatingController: heatingController,
        HotWaterController: hotwaterController
    }
}