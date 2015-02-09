var Hive = require('./index.js');
var util = require('util');
var ClimateControl = require('./climateControl');
var HotWaterControl = require('./hotwaterControl');
var Temperature = require('./temperature');
var hive = new Hive("adrian@lambeth.org", "h1v3user");


function HeatingEventHandler(controller) {
    if (controller != undefined)
    {
        var Modes = controller.Mode;

        controller.on('update', function(data){
            console.log(data);
        });

        controller.on('accepted', function(){
            controller.GetState();
        });

        controller.on('error', function(response){
            console.log(response);
        });

        controller.on('complete', function(response){
            console.log(response);
        });
    }
}


function HotWaterEventHandler(controller) {
    if (controller != undefined)
    {
        var Modes = controller.Mode;

        controller.on('update', function(data){
             console.log(data);
        });

        controller.on('accepted', function(){
            controller.GetState();
        });

        controller.on('error', function(response){
            console.log(response);
        });

        controller.on('complete', function(response){
            console.log(response);
        });
    }
}

function TemperatureEventHandler(controller) {

    if (controller != undefined)
    {
        controller.on('update', function(data){
            console.log(data);
        });

        controller.on('accepted', function(){
            controller.GetState();
        });

        controller.on('error', function(response){
            console.log(response);
        });

        controller.on('complete', function(response){
            console.log(response);
        });
    }

}

hive.on('login', function(context){
    console.log(context);
    var water = new HotWaterControl(context);
    var climate = new ClimateControl(context);
    var temp = new Temperature(context);

    HotWaterEventHandler(water);
    HeatingEventHandler(climate);
    TemperatureEventHandler(temp);

    //temp.GetState(temp.Period.Day);

    //climate.GetSchedule();
    water.GetState();

    setTimeout(function() {
        hive.Logout();
    }, 3000);
});

hive.on('logout', function(){
   console.log('closed');
});

hive.on('not_authorised', function(response){
    console.log(response.error.reason);
});

hive.on('locked', function(response){
    console.log('Your account is locked. You have had 5 successive login failures.');
});

hive.Login();