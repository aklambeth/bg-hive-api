var Widget = require('./Widget');
var util = require('util');
var request = require('request');
var async = require("async");


module.exports = ClimateControl;


function ClimateControl(context) {
    this.context = context;
}

util.inherits(ClimateControl, Widget);

ClimateControl.prototype.Mode = { "Off":"OFF", "Manual":"MANUAL", "Schedule":"SCHEDULE" };

ClimateControl.prototype.SetState = function(req) {
    this.Call({climate:req});
}

ClimateControl.prototype.GetState = function(){
    this.SetState(null);
}

ClimateControl.prototype.TargetTemperature = function(target){
    this.SetState({targetTemperature:{temperatureUnit:'C', temperature:target}});
}