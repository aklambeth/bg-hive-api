#bg-hive-api - Node.js api wrapper to control the British Gas Hive Active Heating system.

##Quick Start
###Connecting
```javascript
var Hive = require('bg-hive-api');
var hive = new Hive("<<your login>>", "<<your password>>");

// on successful login this event handler is called
hive.on('login', function(context){
    console.log('We are are now logged in ' + context);
}

// on logout call this event handler
hive.on('logout', function(){
   console.log('closed');
});

//Log in
hive.Login();

```
