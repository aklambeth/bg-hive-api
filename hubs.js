var request = require('request');
var util = require('util');
var ClimateControl = require('./climateControl');

module.exports = Hubs;

Hubs.prototype.id = function() {
    return this.context.id;
}

Hubs.prototype.HeatingController = function(eventHandler)
{
    var self = this;
    var uri = this.context.uri + 'users/' + this.context.username + "/hubs/" + this.context.id + '/devices/HAHVACThermostatSLR2/only';
    var options = {
        url:uri,
        headers:{'User-Agent': 'bg-hive-api/0.1.0'},
        jar:this.context.authToken,
        method: 'GET'
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            eventHandler(new ClimateControl(self.context, JSON.parse(body)));
        }
        else {
            console.log(response.statusCode + ' - ' + uri);
        }
    });
}

function Hubs(context, hubId) {
    this.context = context;
    this.context.id = hubId;
}