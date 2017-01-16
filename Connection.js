var EventEmitter = require('events').EventEmitter;
var util = require('util');
var request = require('request');
var async = require("async");

module.exports.context = {
    domain:"https://api.prod.bgchprod.info/api",
    headers:{'User-Agent': 'bg-hive-api/1.0.5'},
    username:undefined,
    authToken:undefined,
    hubs:[{
        id:undefined, devices:undefined
    }]
};

function getTaskURI(task){

    var rval = {url:'', body:undefined, method: undefined};

    if (typeof task == 'object') {
        Object.keys(task).forEach(function(key){
            if (key != 'PUT' && key != 'POST' && key != 'GET') {
                var url = '/' + key;
                var result = getTaskURI(task[key]);
                rval = result;
                rval.url = url + result.url;
            }
            else {
                rval.body = task[key];
                rval.method = key;
            }
        });
    }

    return rval;
}


module.exports.command = async.queue(function (task, callback) {

    var options = {
        url:undefined,
        headers:module.exports.context.headers,
        jar:module.exports.context.authToken,
        form: undefined,
        method: undefined,
        qs: undefined,
        strictSSL: false
    };

    if (typeof task == 'object') {
        var result =  getTaskURI(task);
        options.url = module.exports.context.domain + result.url;
        options.method = result.method;

        if (result.method != 'GET')
            options.form = result.body;
        else
            options.qs = result.body;
    }

    request(options, function (error, response, body) {

        callback(error, response, body);

    });

}, 2);