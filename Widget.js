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


Widget.prototype.RequestObject = function(resquestObject) {

    var self = this;
    var task = {};

    if (resquestObject) {
        task = self.context;
        task['users'][connection.context.username]['widgets'][self.deviceName][self.deviceId] = resquestObject;
    }

    return task;
};

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
                    if (error && response.statusCode == 401) {

                        var errorReason = JSON.parse(response.body);

                        if (errorReason.error.reason == 'NOT_AUTHORIZED')
                        {
                            self.emit('not_authorised', errorReason);
                        }

                        if (errorReason.error.reason == 'NO_SUCH_TOKEN')
                        {
                            self.emit('no_token', errorReason);
                        }

                        if (errorReason.error.reason == 'NO_SUCH_SESSION')
                        {
                            self.emit('session_timeout', errorReason);
                        }

                    } else if (error && error.statusCode == 403) {
                        self.emit('not_available');
                    }
                    else if (error) {

                        console.log(error.statusCode);
                        self.emit('error', error);

                    }
                }
            });
        }
        catch (ex) {
            self.emit('error', ex);
        }
}
