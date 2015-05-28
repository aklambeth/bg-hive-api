var request = require('request');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var connection = require('./Connection.js');

module.exports = Hubs;

function Hubs(user) {

    this.hub = user;
    this.hub['users'][connection.context.username] = {'hubs':JSON.parse('{\"' + connection.context.hubs[0].id + '\":{}}')};
    this.context = {
        'id':connection.context.hubs[0].id,
        'deviceId':undefined
    }
}

util.inherits(Hubs, EventEmitter);

function GetDevices(deviceId){

    return {'devices':
        {'hotwater':JSON.parse("{\"" + deviceId + "\":{}}"),
            'climate':JSON.parse("{\"" + deviceId + "\":{}}"),
            'temperature':JSON.parse("{\"" + deviceId + "\":{}}")}
    };

}

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
    getDeviceTask['users'][connection.context.username]['hubs'][connection.context.hubs[0].id] = deviceRequest;

    if (connection.context.hubs[0].devices) {
        self.hub['users'][connection.context.username]['hubs'][connection.context.hubs[0].id] = connection.context.hubs[0].devices;
        callback(self.hub);
    } else {
        connection.command.push(getDeviceTask, function(error, response, body){

            if (!error && response.statusCode == 200) {
                var deviceId = JSON.parse(body);
                connection.context.hubs[0].devices = GetDevices(deviceId.id);
                self.hub['users'][connection.context.username]['hubs'][connection.context.hubs[0].id] = connection.context.hubs[0].devices;

                callback(self.hub);
            }
            else {
                var errorReason = JSON.parse(response.body);
                self.emit('invalid', errorReason);
            }
        });
    }
}