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
            hive.Logout();
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
            hive.Logout();
        });

        controller.on('accepted', function(){
            controller.GetState();
        });

        controller.on('error', function(response){
            console.log(response);
            hive.Logout();
        });

        controller.on('complete', function(response){
            console.log(response);
            hive.Logout();
        });
    }
}

hive.on('login', function(user){
    console.log(user);
    var water = new HotWaterControl(user);
    var climate = new ClimateControl(user);

    HotWaterEventHandler(water);
    HeatingEventHandler(climate);
    climate.GetState();
    water.GetState();

});

hive.on('logout', function(){
   console.log('closed');
});


hive.Login();

