var EventEmitter = require('events').EventEmitter;
var util = require('util');
var extend = require('util')._extend;
var connection = require('./Connection.js');

module.exports.Connections = 0;

module.exports = Widget;

function Widget(context, name)
{
    this.hubId = Object.keys(context['users'][connection.context.username]['hubs'])[0]; // we only support one hub for now.
    this.deviceId = Object.keys(context['users'][connection.context.username]['hubs'][this.hubId]['devices'][name])[0];
    this.deviceName = name;

    EventEmitter.call(this);
}

util.inherits(Widget, EventEmitter);


Widget.prototype.Call = function(resquestObject) {
        var self = this;

        try {

            var task = {};

            if (resquestObject) {
                task = JSON.parse("{\"users\":{\"" + connection.context.username + "\":{}}}");
                task['users'][connection.context.username] = {'widgets':
                    JSON.parse("{\"" + this.deviceName + "\":{\"" + this.deviceId + "\":{}}}")
                };
                task['users'][connection.context.username]['widgets'][this.deviceName][this.deviceId] = resquestObject;
            }
            else
            {
                this.emit('error');
                return;
            }
            connection.command.push(task, function(error, response, body){

                if (!error && response.statusCode == 200) {
                    self.emit('complete', JSON.parse(body));
                } else if (!error && response.statusCode == 204) {
                    self.emit('accepted');
                }
                else {
                    var errorReason = JSON.parse(response.body);
                    if (response.statusCode == 401) {
                        if (errorReason.error.reason == 'NOT_AUTHORIZED') {
                            self.emit('not_authorised', errorReason);
                        } else if (errorReason.error.reason == 'NO_SUCH_TOKEN') {
                            self.emit('no_token', errorReason);
                        } else if (errorReason.error.reason == 'NO_SUCH_SESSION') {
                            self.emit('session_timeout', errorReason);
                        }
                    } else if (response.statusCode == 403) {
                        self.emit('not_available', errorReason);
                    } else if (response.statusCode == 404) {
                        self.emit('invalid', errorReason);
                    } else if (response.statusCode == 503) {
                        self.emit('rate_limit', errorReason);
                    } else if (error) {
                        self.emit('error', error);
                    }
                }
            });
        }
        catch (ex) {
            self.emit('error', ex);
        }
}
