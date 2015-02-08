var Widget = require('./Widget');
var util = require('util');
var request = require('request');


module.exports = Temperature;

function Temperature(context) {
    Widget.call(this, context, "temperature");
}

util.inherits(Temperature, Widget);

Temperature.prototype.Period = {Hour:'thisHour', Day:'today', Week:'thisWeek', Month:'thisMonth', Year:'thisYear'}

Temperature.prototype.GetState = function(period){

    var task = {
        'history':{
            'GET':{
                'period':period
            }
        }
    };
    this.Call(task);
}