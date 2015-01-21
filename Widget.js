var EventEmitter = require('events').EventEmitter;
var util = require('util');
var request = require('request');
var async = require("async");

module.exports = Widget;

function Widget(context)
{
    this.context = context;
    EventEmitter.call(this);
}

util.inherits(Widget, EventEmitter);

Widget.prototype.Call = function(data) {
        var self = this;


        try {

            var req = {};
            var widget = {};

            if (data) {
                widget = Object.keys(data)[0];
            }
            else
            {
                this.emit('error');
                return;
            }


            if (data[widget] && data[widget] != null)
                req = data[widget];

            var uri = this.context.uri + 'users/' + this.context.username + "/widgets/" + widget + '/' + this.context.controller + '/';

            async.each(Object.keys(req), function(key, callback) {

                var options = {
                    url:uri + key,
                    headers:{'User-Agent': 'bg-hive-api/0.1.0'},
                    jar:self.context.authToken,
                    form: req[key],
                    method: 'PUT'
                };

                request(options, function (error, response, body) {
                    if (!error && response.statusCode == 204) {
                        self.emit('accepted');
                    }
                    else
                    {
                        callback(response);
                    }
                });
            }, function(err){

                if (err && err.statusCode == 401) {

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

                }
                else if (err && err.statusCode == 403) {
                    self.emit('not_available');
                }
                else if (err){

                    console.log(err.statusCode + ' - ' + uri);
                    self.emitdata[widget]('error', err);

                }
                else
                {
                    var options = {
                        url:uri,
                        jar:self.context.authToken,
                        headers:{'User-Agent': 'bg-hive-api/0.1.0'},
                        method: 'GET'
                    };

                    request(options, function (error, response, body) {

                        if (!error && response.statusCode == 200) {
                            self.emit('complete', JSON.parse(body));
                        }
                        else {
                            console.log(response.statusCode + ' - ' + uri);
                        }

                    });
                }
            });

        }
        catch (ex) {
            self.emit('error', ex);
        }
}
