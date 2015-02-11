#British Gas Hive Active Heating. Node.js API.

##Installation

```
sudo npm install bg-hive-api
```
##Examples
###Connecting
Before we can anything we first have to authenticate with the remote server and create an active session.

First authenticate by instantiating the 'Hive' object with your login credentials, the same user name and password you use to login to the Hive website and App, then call the Login() method.

If you are logged in successfully the login event handler is called with the session context object. You are now able to control your heating system.

When you're finished call the Logout() method to close the session. The logout event handler will be called whenever the session is closed.

The following program demonstrates these steps by establishing an connection and then immediately logging out again if a successful connection was established. If you don't see *connected* displayed in the console then a connection could not be established, either because your login credentials were wrong or a connection to the remote server could not be established.

```javascript
var Hive = require('bg-hive-api');
var hive = new Hive("<<your login>>", "<<your password>>");

// on successful login this event handler is called
hive.on('login', function(context){
    console.log('Connected');
    hive.Logout();
}

// on logout call this event handler
hive.on('logout', function(){
   console.log('Connection Closed');
});

//Log in
hive.Login();

```
###ClimateController

```javascript
var ClimateControl = require('bg-hive-api/climateControl');
```

Use the ClimateControl object to set and read the current state of your heating. The following program will return the current state of the heating system.

```javascript
var Hive = require('bg-hive-api');
var ClimateControl = require('bg-hive-api/climateControl');
var hive = new Hive("<<your login>>", "<<your password>>");

// on successful login this event handler is called
hive.on('login', function(context){

    // Create an instance of the climate controller
    var climate = new ClimateControl(context);

    // Handle the on complete event.
    climate.on('complete', function(response){
        // write the response state object to the console.
        console.log(response);
        // log out
        hive.Logout();
    });

    climate.GetState();
});

// on logout call this event handler
hive.on('logout', function(){
   console.log('Connection Closed');
});

//Log in
hive.Login();

```

The following *login* event handler will set the temperature to a constant 19 degrees C before closing the session on successful response.

```javascript
// on successful login this event handler is called
hive.on('login', function(context){

    // Create an instance of the climate controller
    var climate = new ClimateControl(context);

    // Handle the on complete event.
    climate.on('complete', function(response){
        // write the response state object to the console.
        console.log(response);
        // log out
        hive.Logout();
    });

    // Set the heating state to Manual
    climate.SetState(climate.Mode.Manual);

    climate.once('accepted', function(response){
        climate.GetState();;
    });

    // Set the temperature to 19 C
    climate.TargetTemperature(19);
});
```
If successful you will see the response output in the console window.

```
{ devices: { '00-AA-BB-CC-DD-EE-FF-11': 'Your Receiver' },
  deviceAvailable: true,
  battery: 'OK',
  mode: 'HEAT',
  control: 'MANUAL',
  on: true,
  isSchedule: false,
  presenceStatus: 'HOME',
  currentTemperature: 19,
  targetTemperature: 19,
  shadowTemperature: 19,
  ...
Connection Closed
```
###HotWaterController

```javascript
var HotWaterControl = require('bg-hive-api/hotwaterControl');
```
The HotWaterControl object is used to set and request the current state of the hot water if your system supports it.

The following event handler sets the state of the hot water to *Scheduled*.

```javascript
// on successful login this event handler is called
hive.on('login', function(context){

    // Create an instance of the hot water controller
    var water = new HotWaterControl(context);

    // Handle the on complete event.
    water.on('complete', function(response){
        // write the response state object to the console.
        console.log(response);
        // log out
        hive.Logout();
    });

    water.once('accepted', function(response){
        water.GetState();;
    });

    // Set the hot water to scheduled
    water.SetState(water.Mode.Schedule);
});
```
If successful you will see the response in the console.

```
{ current: 'SCHEDULE',
  temperature: '200.0',
  temperatureUnit: 'C',
  available: [ 'SCHEDULE', 'MANUAL', 'BOOST', 'OFF' ] }
Connection Closed
```
###Temperature History

```javascript
var Temperature = require('bg-hive-api/temperature');
```
Use the Temperature object to get temperature data recorded by the thermostat over a defined period. In the following example the current days temperature history data is requested.

```javascript
// on successful login this event handler is called
hive.on('login', function(context){

    // Create an instance of the temperature history controller
    var temp = new Temperature(context);

    // Handle the on complete event.
    temp.on('complete', function(response){
        // write the response state object to the console.
        console.log(response);
        // log out
        hive.Logout();
    });

    // Get today's temperature history
    temp.GetState(temp.Period.Day);
});
```
A successful request will display the temperature data in the console.

```
{ period: 'today',
  data:
   [ { date: '2015-01-10 0:00', temperature: 20.29 },
     { date: '2015-01-10 0:30', temperature: 20.08 },
     { date: '2015-01-10 1:00', temperature: 19.65 },
     ...
     { date: '2015-01-10 23:00', temperature: 19.31 },
     { date: '2015-01-10 23:30', temperature: '--' } ],
  temperatureUnit: 'C' }
Connection Closed
```
