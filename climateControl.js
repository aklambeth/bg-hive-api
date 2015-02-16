var Widget = require('./Widget');
var util = require('util');
var request = require('request');


module.exports = ClimateControl;


function ClimateControl(context) {
    Widget.call(this, context, "climate");
}

util.inherits(ClimateControl, Widget);

ClimateControl.prototype.Mode = { "Off":"OFF", "Manual":"MANUAL", "Schedule":"SCHEDULE", "Override":"OVERRIDE" };

ClimateControl.prototype.SetState = function(req) {

    var task = {
        'control':{
            'PUT':{'control':req}
        }
    };

    this.Call(task);
}

ClimateControl.prototype.GetState = function(){

    this.Call({GET:{}});
}

ClimateControl.prototype.TargetTemperature = function(target){

    var task = {
        'targetTemperature':{
            'PUT':{
                'temperatureUnit':'C',
                'temperature':target
            }
        }
    };

    this.Call(task);
}

ClimateControl.prototype.GetSchedule = function(){

    var task = {
        'controls':{
            'schedule':{
                'GET':{}
            }
        }
    };

    this.Call(task);
}