var Hive = require('./index.js');
var util = require('util');
var ClimateControl = require('./climateControl');
var HotWaterControl = require('./hotwaterControl');
var hive = new Hive("adrian@lambeth.org", "1396734046");


function HeatingEventHandler(controller)
{
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


function HotWaterEventHandler(controller)
{
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

hive.on('login', function(context){
    console.log(context);
    var water = new HotWaterControl(context);
    var climate = new ClimateControl(context);

    HotWaterEventHandler(water);
    HeatingEventHandler(climate);

    climate.GetSchedule();
    water.GetState();

    hive.Logout();

});

hive.on('logout', function(){
   console.log('closed');
});

hive.Login();

