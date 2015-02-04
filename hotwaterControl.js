var Widget = require('./Widget');
var util = require('util');
var request = require('request');


module.exports = HotWaterControl;

function HotWaterControl(context) {
    Widget.call(this, context, "HotWaterController");
}

util.inherits(HotWaterControl, Widget);

HotWaterControl.prototype.Mode = { "Schedule":"SCHEDULE", "Manual":"MANUAL", "Boost":"BOOST" };
HotWaterControl.prototype.State = { "On":"ON", "Off":"OFF"};
HotWaterControl.prototype.SetState = function(state)
{
    var task = {
        'controls':{
            'PUT':{
                'operation':state
            }
        }
    };

    this.Call(task);
}

HotWaterControl.prototype.GetState = function(){

    var task = {
        'controls':{
            'GET':{}
        }
    };

    this.Call(task);
}