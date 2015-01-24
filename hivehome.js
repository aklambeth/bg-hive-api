var Hive = require('./index.js');
var util = require('util');

var hive = new Hive("adrian@lambeth.org", "1396734046");

function HeatingEventHandler(controller)
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


hive.on('login', function(controllers){

    var heatingController = controllers.HeatingController;;
    var hotwaterController = controllers.HotWaterController;

    HeatingEventHandler(heatingController);
    HotWaterEventHandler(hotwaterController);


    heatingController.SetState({"controls":{"operation":"SCHEDULE"}});

});

hive.on('logout', function(){
    console.log('-> Closed');
});

hive.Login();

