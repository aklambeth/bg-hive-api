var Widget = require('./Widget');
var util = require('util');
var request = require('request');
var async = require("async");


module.exports = HotWaterControl;

function HotWaterControl(context) {
    this.context = context;
}

util.inherits(HotWaterControl, Widget);

HotWaterControl.prototype.Mode = { "Schedule":"SCHEDULE", "Manual":"MANUAL", "Boost":"BOOST" };
HotWaterControl.prototype.State = { "On":"ON", "Off":"OFF"};
HotWaterControl.prototype.SetState = function(state)
{
    var post = {hotwater:state};

    this.Call(post, this.METHOD.Put);
}

HotWaterControl.prototype.GetState = function(){
    this.Call({hotwater:null}, this.METHOD.Put);
}