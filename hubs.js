var request = require('request');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var connection = require('./Connection.js');

module.exports = Hubs;

function Hubs(user, hubId) {

    this.hub = user;
    this.hub['users'][connection.context.username] = {'hubs':JSON.parse('{\"' + hubId + '\":{}}')};
    this.context = {
        'id':hubId,
        'deviceId':undefined
    }
}

util.inherits(Hubs, EventEmitter);

Hubs.prototype.FindController = function(callback) {

    var self = this;

    var deviceRequest = {
        devices:{
            HAHVACThermostatSLR2:{
                only:{
                    GET:''
                }
            }
        }
    };

    var getDeviceTask = self.hub;
    getDeviceTask['users'][connection.context.username]['hubs'][self.context.id] = deviceRequest;

    connection.command.push(getDeviceTask, function(error, response, body){

        if (!error && response.statusCode == 200) {
            var deviceId = JSON.parse(body);

            var devices = {'devices':
                    {'HotWaterController':JSON.parse("{\"" + deviceId.id + "\":{}}"),
                     'HeatingController':JSON.parse("{\"" + deviceId.id + "\":{}}")}
                };

            self.hub['users'][connection.context.username]['hubs'][self.context.id] = devices;

            callback(self.hub);
        }
        else {
            console.log(response.statusCode + ' ' + response.uri);
        }
    });
}