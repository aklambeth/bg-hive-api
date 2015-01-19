var EventEmitter = require('events').EventEmitter;
var util = require('util');
var request = require('request');

module.exports = ClimateControl;


function ClimateControl(context, controller) {
    this.context = context;
    this.context.controller = controller.id;
}

util.inherits(ClimateControl, EventEmitter);

ClimateControl.prototype.Mode = { "Off":"OFF", "Manual":"MANUAL", "Schedule":"SCHEDULE" };

ClimateControl.prototype.GetState = function(){
    var self = this;
    var uri = this.context.uri + 'users/' + this.context.username + "/widgets/climate/" + this.context.controller;
    var options = {
        url:uri,
        jar:this.context.authToken,
        headers:{'User-Agent': 'bg-hive-api/0.1.0'},
        method: 'GET'
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            self.emit('update', JSON.parse(body));
        }
        else {
            console.log(response.statusCode + ' - ' + uri);
        }
    });
}

ClimateControl.prototype.Control = function(control){
    var self = this;
    var uri = this.context.uri + 'users/' + this.context.username + "/widgets/climate/" + this.context.controller + '/control'
    var data = {control:control};
    var options = {
        url:uri,
        headers:{'User-Agent': 'bg-hive-api/0.1.0'},
        jar:this.context.authToken,
        method: 'PUT',
        form: data
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 204) {
            // Print out the response body
            self.emit('accepted');
        }
        else {
            console.log(response.statusCode + ' - ' + uri);
            self.emit('error', response);
        }
    });
}