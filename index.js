var request = require('request');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Hub = require('./hubs');
var connection = require('./Connection.js');

var config = {

    credentials : {
        "username": '', "password": ''
    },

    api : {
        "Hive": "https://api-prod.bgchprod.info/v5",
        "AlertMe" : "https://api.alertme.com/v5"
    }
}

function Hive(username, password, api) {

    config.credentials.username = username;
    config.credentials.password = password;

    if (!api)
        api = 'Hive';

    if (api == "AlertMe")
        connection.context.domain = config.api.AlertMe;
    else
        connection.context.domain = config.api.Hive;

}
util.inherits(Hive, EventEmitter);

logout = function(self){

    var logoutTask = {
        logout:{
            POST:{}
        }
    }

    connection.command.push(logoutTask, function (error, response, body) {

        if (!error && response.statusCode == 204) {
            connection.context.authToken = undefined;
            connection.context.username = undefined;
            self.emit('logout');
        }
        else {
            console.log(response.statusCode);
        }

        // stop the queue from processing and clear down all tasks
        connection.command.pause();
        connection.command.kill();

    });
}

Hive.prototype.Login = function() {

    var loginTask = {
        login:{
            POST:{
                "username": config.credentials.username,
                "password": config.credentials.password,
                "caller": "HiveHome"
            }
        }
    }

    var self = this;

    // if we're already connected then re-use the existing connection
    if (connection.context.authToken && connection.context.username) {
        var hub = new Hub(JSON.parse('{\"users\":{\"' + connection.context.username + '\":{}}}'));
        hub.FindController(function(deviceId){
            // remove the drain callback which may log us out again
            connection.command.drain = undefined;
            self.emit('login', deviceId);
        });

    } else {
        // re-authenticate our credentials with the server
        connection.command.unshift(loginTask, function(error, response, body){

            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);

                var j = request.jar();
                j.setCookie(request.cookie('ApiSession=' + data.ApiSession), config.api.Hive);
                connection.context.authToken = j;
                connection.context.username = data.username;
                var userObject = JSON.parse('{\"users\":{\"' + data.username + '\":{}}}');

                if (data.hubIds && data.hubIds.length > 0) {
                    connection.context.hubs[0].id = data.hubIds[0];
                    var hub = new Hub(userObject);
                    hub.FindController(function(deviceId){
                        // remove the drain callback which may log us out again
                        connection.command.drain = undefined;
                        self.emit('login', deviceId);
                    });
                }

            } else {
                var errorReason = JSON.parse(response.body);
                if (response.statusCode == 400) {
                    if (errorReason.error.reason == 'USERNAME_PASSWORD_ERROR') {
                        self.emit('not_authorised', errorReason);
                    } else if (errorReason.error.reason == 'ACCOUNT_LOCKED') {
                        self.emit('locked', errorReason);
                    } else if (errorReason.error.reason == 'TOKENS_ARE_NOT_COMPATIBLE_WITH_LOGIN') {
                        self.emit('invalid', errorReason);
                    }
                } else if (response.statusCode == 500) {
                    self.emit('unavailable', errorReason);
                } else if (response.statusCode == 503) {
                    self.emit('rate_limit', errorReason);
                }
            }
        });
    }

    // resume processing the queue
    if (connection.command.paused)
        connection.command.resume();
}



Hive.prototype.Logout = function() {

    var self = this;

    if (!connection.command.idle()) {
        connection.command.drain = function(){
            logout(self);
        };
    } else {
        logout(self);
    }
};

module.exports = Hive;


