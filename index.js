var request = require('request');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var config = require('config-node')({
    dir: 'config', // where to look for files
    ext: null, // spoil the fun, tell me which one it is ('' for directory). Improves performance.
    env: process.env.NODE_ENV || 'development' // set which one instead of smart defaults
});
var hub = require('./hubs');

function Hive() {}
util.inherits(Hive, EventEmitter);

Hive.prototype.Login = function() {
    var uri = config.api.v5 + 'login';
    var formdata = {
        "username": config.credentials.username,
        "password": config.credentials.password,
        "caller": "HiveHome"
    };

    var hubs = {};
    var self = this;

    console.log('->login - ' + uri );

    var options = {
        url:uri,
        headers:{'User-Agent': 'bg-hive-api/0.1.0'},
        form:formdata,
        method: 'POST'
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body);

            var j = request.jar();
            j.setCookie(request.cookie('ApiSession=' + data.ApiSession), config.api.v5);

            var context = {
                "authToken":j,
                "username" : config.credentials.username,
                "userId" : data.userId,
                "uri" : config.api.v5
            }

            self.context = context;

            for(var i = 0; i < data.hubIds.length;i++){
                hubs[i] = new hub(context, data.hubIds[i]);
            }
            self.emit('login', hubs);
        }
        else {
            console.log(response.statusCode + ' - ' + uri);
        }
    });
}

Hive.prototype.Logout = function() {
    var uri = config.api.v5 + 'logout';
    var self = this;

    var options = {
        url:uri,
        headers:{'User-Agent': 'bg-hive-api/0.1.0'},
        jar:self.context.authToken,
        method: 'POST'
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 204) {
            self.context = undefined;
            self.emit('logout');
        }
        else {
            console.log(response.statusCode + ' - ' + uri);
        }
    });
};

module.exports = Hive;


