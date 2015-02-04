var EventEmitter = require('events').EventEmitter;
var util = require('util');
var connection = require('./Connection.js');

module.exports.Connections = 0;

module.exports = Widget;

function Widget(context, name)
{
    this.hubId = Object.keys(context['users'][connection.context.username]['hubs'])[0]; // we only support one hub for now.
    this.deviceId = Object.keys(context['users'][connection.context.username]['hubs'][this.hubId]['devices'][name])[0];

    this.context = context;
    // now set the active device to hotwater
    this.context['users'][connection.context.username]['hubs'][this.hubId]['devices'] =
        JSON.parse("{\"" + name + "\":{\"" + this.deviceId + "\":{}}}");

    EventEmitter.call(this);
}

util.inherits(Widget, EventEmitter);

Widget.prototype.METHOD = {Get:'GET', Put:'PUT', Post:'POST'}

Widget.prototype.Call = function(resquestObject) {
        var self = this;

        try {

            var task = {};

            if (resquestObject) {
                task = self.context;
                task['users'][connection.context.username]['hubs'][this.hubId]['devices']['HotWaterController'][this.deviceId] = resquestObject;
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
                            self.emit('not_authorised', control);
                        }

                        if (errorReason.error.reason == 'NO_SUCH_TOKEN')
                        {
                            self.emit('no_token', control);
                        }

                        if (errorReason.error.reason == 'NO_SUCH_SESSION')
                        {
                            self.emit('session_timeout', control);
                        }

                    } else if (error && err.statusCode == 403) {
                        self.emit('not_available');
                    }
                    else if (error) {

                        console.log(err.statusCode + ' - ' + uri);
                        self.emit('error', err);

                    }
                }
            });

//
//            if (data[widget] && data[widget] != null)
//                req = data[widget];
//
//            var uri = this.context.uri + 'users/' + this.context.username + "/widgets/" + widget + '/' + this.context.controller + '/';
//
//            async.each(Object.keys(req), function(key, callback) {
//
//                var options = {
//                    url:uri + key,
//                    headers:{'User-Agent': 'bg-hive-api/0.1.0'},
//                    jar:self.context.authToken,
//                    form: req[key],
//                    method: method
//                };
//
//                request(options, function (error, response, body) {
//                    module.exports.Connections--;
//                    if (!error && response.statusCode == 204) {
//                        self.emit('accepted');
//                    }
//                    else if(!error && method == self.METHOD.Get && response.statusCode == 200) {
//                        self.emit('complete', JSON.parse(body));
//                    }
//                    else
//                    {
//                        callback(response);
//                    }
//                });
//            }, function(err){
//
//                if (err && err.statusCode == 401) {
//
//                    var errorReason = JSON.parse(response.body);
//
//                    if (errorReason.error.reason == 'NOT_AUTHORIZED')
//                    {
//                        self.emit('not_authorised', control);
//                    }
//
//                    if (errorReason.error.reason == 'NO_SUCH_TOKEN')
//                    {
//                        self.emit('no_token', control);
//                    }
//
//                    if (errorReason.error.reason == 'NO_SUCH_SESSION')
//                    {
//                        self.emit('session_timeout', control);
//                    }
//
//                }
//                else if (err && err.statusCode == 403) {
//                    self.emit('not_available');
//                }
//                else if (err){
//
//                    console.log(err.statusCode + ' - ' + uri);
//                    self.emit('error', err);
//
//                }
//                else
//                {
//                    var options = {
//                        url:uri,
//                        jar:self.context.authToken,
//                        headers:{'User-Agent': 'bg-hive-api/0.1.0'},
//                        method: 'GET'
//                    };
//
//                    request(options, function (error, response, body) {
//
//                        if (!error && response.statusCode == 200) {
//                            self.emit('complete', JSON.parse(body));
//                        }
//                        else {
//                            console.log(response.statusCode + ' - ' + uri);
//                        }
//
//                    });
//                }
//            });
//
        }
        catch (ex) {
            self.emit('error', ex);
        }
}
