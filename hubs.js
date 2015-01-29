var request = require('request');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var ClimateControl = require('./climateControl');
var HotWaterControl = require('./hotwaterControl');
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

            var devices = {'devices':[
                    {'HotWaterController':JSON.parse("{\"" + deviceId.id + "\":{}}")},
                    {'HeatingController':JSON.parse("{\"" + deviceId.id + "\":{}}")}
                ]};

            self.hub['users'][connection.context.username]['hubs'][self.context.id] = devices;

            callback(self.hub);
        }
        else {
            console.log(response.statusCode + ' ' + response.uri);
        }
    });

//    var uri = this.context.uri + 'users/' + this.context.username + "/hubs/" + this.context.id + '/devices/HAHVACThermostatSLR2/only';



//    var options = {
//        url:uri,
//        headers:{'User-Agent': 'bg-hive-api/0.1.0'},
//        jar:this.context.authToken,
//        method: 'GET'
//    };
//
//    if (!this.context.controller) {
//
//        request(options, function (error, response, body) {
//            if (!error && response.statusCode == 200) {
//                var deviceId = JSON.parse(body);
//                self.context.controller = deviceId.id;
//                self.emit('complete', self.GetControllers());
//            }
//            else {
//                console.log(response.statusCode + ' - ' + uri);
//            }
//        });
//
//    }
//    else {
//        self.emit('complete', self.GetControllers());
//    }
}

Hubs.prototype.GetControllers = function() {

    var heatingController = new ClimateControl(this.context);
    var hotwaterController = new HotWaterControl(this.context);

    return {
        HeatingController: heatingController,
        HotWaterController: hotwaterController
    }
}