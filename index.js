var rest = require('restler');

exports.HiveHome = function () {
    
    var headers = { 'Accept': '*/*', 'User-Agent': 'Restler for node.js', 'Cookie' : '' };

    function Login(val) {
        console.log('->Login');
        rest.post('https://api.bgchlivehome.co.uk/v5/login', {
            data: { "username": "adrian@lambeth.org", "password": "1396734046", "caller": "HiveHome" },
        }, {headers:headers}).on('complete', function (data, response) {
            console.log('-->Response ' + response.statusCode);
            if (response.statusCode == 200) {
                headers.Cookie = 'ApiSession=' + data.ApiSession;
                console.log(headers.Cookie);
                GetHubs();
            }
        });
    }
    return Login();
    
 }