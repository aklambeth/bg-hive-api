#Hive Active Heating. API.

[![npm package](https://nodei.co/npm/bg-hive-api.png?downloads=true&downloadRank=false&stars=true)](https://nodei.co/npm/bg-hive-api/)

This node.js module provides a wrapper around the REST API provided by British Gas to control your [Hive home heating system](http://www.hivehome.com).

## Note
This software is in **not endorsed by British Gas.** The underlying api is therefore subject to change at any time, which means this code library may suddenly stop working. **Use at your own risk**.

### Release Notes

** 1.0.4 **
* Fixed - Issue with inconsistent heating thermostat type was preventing discovery in some systems, 'which meant it wouldn't work!'
* New - Rate limiting event added on connection. 
* New - Added boost function for heating.
* Tidy up this here documentation!

##Installation

```
npm install bg-hive-api
```

## Connecting

Before we can anything we first have to authenticate with the remote server and create an active session.
First authenticate by instantiating the 'Hive' object with your login credentials, the same user name and password you use to login to the Hive website and App, then call the Login() method.

The following program demonstrates these steps by establishing an connection and then immediately logging out again if a successful connection was established. If you don't see *connected* displayed in the console then a connection could not be established, either because your login credentials were wrong or a connection to the remote server could not be established.

```javascript
var Hive = require('bg-hive-api');
var hive = new Hive("<<your login>>", "<<your password>>");

// on successful login this event handler is called
hive.on('login', function(context){
    console.log('Connected');
    hive.Logout();
});

// on logout call this event handler
hive.on('logout', function(){
   console.log('Connection Closed');
});

// on invalid username or password
hive.on('not_authorised', function(){
   console.log('Connection Refused');
});

//Log in
hive.Login();

```

### `Login()`

If you are logged in successfully the login event handler is called with the session context object. You are now able to control your heating system.

```javascript
// on successful login this event handler is called
hive.on('login', function(context){
    console.log('Connected');
    hive.Logout();
});

hive.Login();
```

** Events **
* login - On Success. Returns :- Connection `context` object.


* not_authorised - Incorrect user name or password. Returns :- `error`
* locked - Account was locked after 5 failed log in attempts. Returns :- `error`
* invalid - Invalid login attempt. Returns :- `error`
* rate_limit - Requests to the API are rate limited. Returns :- `error`
* session_timout - The current session has expired. Typically after 20 minutes.

### `Logout()`

When you're finished call the Logout() method to close the session. The logout event handler will be called whenever the session is closed.

## ClimateController

Use the ClimateControl object to set and read the current state of your heating.

```javascript
var ClimateControl = require('bg-hive-api/climateControl');
```

### `GetState()`

The following program will return the current state of the heating system.

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

// on invalid username or password
hive.on('not_authorised', function(){
   console.log('Connection Refused');
});

//Log in
hive.Login();

```

** Events **
* completed - The request was completed sucessfully


* not_authorised - Incorrect user name or password
* session_timout - The current session has expired
* rate_limit - Requests to the API are rate limited
* not_available - Remote server is not responding
* error - Something broke! Check the error response object

### `SetState( mode )`

The SetState method can be used to set the current heating mode.

```javascript
...
    var climate = new ClimateControl(context);
    climate.SetState(climate.Mode.Boost);
    
    // Handle the on accepted event.
    climate.on('accepted', function(response){
        ...
    });
...

```

** Events **
* accepted - The update has been accepted


* not_authorised - Incorrect user name or password
* session_timout - The current session has expired
* rate_limit - Requests to the API are rate limited
* not_available - Remote server is not responding
* error - Something broke! Check the error response object

** Parameters **

* `Mode.Off` - Frost protection.
* `Mode.Manual` - Maintain the current target temperature.
* `Mode.Schedule` - On scheduled timer.
* `Mode.Boost`

### `TargetTemperature( temperature )`

The following *login* event handler will set the temperature to a constant 19 degrees C before closing the session on successful response.
Note the accepted event handler is set to once to prevent it being called again after we change the target temperature.

```javascript

...
// on successful login this event handler is called
hive.on('login', function(context){

    // Create an instance of the climate controller
    var climate = new ClimateControl(context);

    climate.once('accepted', function(response){
        climate.GetState();;
    });

    // Set the heating state to Manual
    climate.SetState(climate.Mode.Manual);
    
    // Set the temperature to 19 C
    climate.TargetTemperature(19);
    
    hive.Logout();
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
## HotWaterController

The HotWaterControl object is used to set and request the current state of the hot water if your system supports it.

```javascript
var HotWaterControl = require('bg-hive-api/hotWaterControl');
...
Hive.on('login', function(context){
    var hotwater = new HotWaterControl(context);
});
```


### `GetState()`

Return the current state of the hot water system.

** Events **
* completed - The request was completed sucessfully


* not_authorised - Incorrect user name or password
* session_timout - The current session has expired
* rate_limit - Requests to the API are rate limited
* not_available - Remote server is not responding
* error - Something broke! Check the error response object


### `SetState( mode )`

The following event handler sets the state of the hot water to *Scheduled* and returns the current active state.

```javascript
...
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
        water.GetState();
    });

    // Set the hot water to scheduled
    water.SetState(water.Mode.Schedule);
    hive.Logout();
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
** Events **
* accepted - The update has been accepted


* not_authorised - Incorrect user name or password
* session_timout - The current session has expired
* rate_limit - Requests to the API are rate limited
* not_available - Remote server is not responding
* error - Something broke! Check the error response object

Parameters

* `Mode.Off` - Hot water is off.
* `Mode.Manual`
* `Mode.Schedule` - On pre-programmed scheduled timer.
* `Mode.Boost` - Turn on hot water for one hour.

## Temperature History

Use the Temperature object to get temperature data recorded by the thermostat over a defined period. In the following example the current days temperature history data is requested.

```javascript
var Temperature = require('bg-hive-api/temperature');
...
hive.on('login', function(context){
    var temperature = new Temperature(context);
});

```

### `GetState()`


Get the temperature history recorded by the thermostat over a defined period.

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
** Events **
* completed - The request was completed sucessfully


* not_authorised - Incorrect user name or password
* session_timout - The current session has expired
* rate_limit - Requests to the API are rate limited
* not_available - Remote server is not responding
* error - Something broke! Check the error response object

**Parameters**

* `Period.Hour`
* `Period.Day`
* `Period.Week`
* `Period.Month`
* `Period.Year`


## Event Handling

It's generally easier and clearer to create separate handler functions to handle events for each controller object as in the following pattern.

```javascript
...
function HeatingEventHandler(controller) {
    if (controller != undefined)
    {
        controller.on('update', function(data){
            console.log(data);
        });

        controller.on('accepted', function(){
            console.log('OK');
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
        controller.on('update', function(data){
             console.log(data);
        });

        controller.on('accepted', function(){
            console.log('OK')
        });

        controller.on('error', function(response){
            console.log(response);
        });

        controller.on('complete', function(response){
            console.log(response);
        });
    }
}

...
hive.on('login', function(context){
    var climate = new ClimateControl(context);
    var hotwater = new HotWaterControl(context);

    HotWaterEventHandler(hotwater);
    HeatingEventHandler(climate);

    hive.Logout();
});

...

```
