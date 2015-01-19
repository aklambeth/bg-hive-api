var EventEmitter = require('events').EventEmitter;
var util = require('util');
var request = require('request');
var async = require("async");


module.exports = ClimateControl;


function ClimateControl(context, controller) {
    this.context = context;
    this.context.controller = controller.id;
}

util.inherits(ClimateControl, EventEmitter);

ClimateControl.prototype.Mode = { "Off":"OFF", "Manual":"MANUAL", "Schedule":"SCHEDULE" };

ClimateControl.prototype.SetState = function(req) {
    var self = this;
    var uri = this.context.uri + 'users/' + this.context.username + "/widgets/climate/" + this.context.controller + '/';

    try {

        if (!req)
            req = {};

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
            else if (err){

                console.log(err.statusCode + ' - ' + uri);
                self.emit('error', err);

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

ClimateControl.prototype.GetState = function(){
    this.SetState(null);
}

ClimateControl.prototype.TargetTemperature = function(target){
    this.SetState({targetTemperature:{temperatureUnit:'C', temperature:target}});
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
        else if (!error && response.statusCode == 401) {
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
        else {
            console.log(response.statusCode + ' - ' + uri);
            self.emit('error', response);
        }
    });
}