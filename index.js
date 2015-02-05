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
        "Hive": "https://api.bgchlivehome.co.uk/v5/",
        "AlertMe" : "https://api.alertme.com/v5"
    }
}

function Hive(username, password, api) {

    config.credentials.username = username;
    config.credentials.password = password;

    if (!api)
        api = 'Hive';

    var uri;
    if (api == "AlertMe")
        uri = config.api.AlertMe;
    else
        uri = config.api.Hive;

    var context = {
        user:undefined,
        hub:undefined
    }

    this.context = context;

}
util.inherits(Hive, EventEmitter);

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

    connection.command.push(loginTask, function(error, response, body){

        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body);

            var j = request.jar();
            j.setCookie(request.cookie('ApiSession=' + data.ApiSession), config.api.Hive);
            connection.context.authToken = j;
            connection.context.username = data.username;
            var userObject = JSON.parse('{\"users\":{\"' + data.username + '\":{}}}');
            if (data.hubIds && data.hubIds.length > 0) {
                var hub = new Hub(userObject, data.hubIds[0]);

                hub.FindController(function(deviceId){

                    self.emit('login', deviceId);
                });
            }

        }
        else {
            console.log(response.statusCode);
        }
    });
}

Hive.prototype.Logout = function() {

    var self = this;

    connection.command.drain = function(){

        var logoutTask = {
            logout:{
                POST:{}
            }
        }

        connection.command.push(logoutTask, function (error, response, body) {

            if (!error && response.statusCode == 204) {
                self.context.authToken = undefined;
                connection.context.authToken = undefined;
                connection.context.username = undefined;
                self.emit('logout');
            }
            else {
                console.log(response.statusCode);
            }

            connection.command.kill();

        });
    };
};

module.exports = Hive;


