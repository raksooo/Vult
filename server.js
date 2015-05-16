var express = require('express');
var http = require('http');
var mysql = require('mysql');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

var server = app.listen(8888, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Server up and running', host, port);

});

login();


function login() {
  var xmlData = "<methodCall>" +
    "<methodName>LogIn</methodName>" +
    "<params>" +
    "<param>" +
    "<value><string></string></value>" +
    "</param>" +
    "<param>" +
    "<value><string></string></value>" +
    "</param>" +
    "<param>" +
    "<value><string>en</string></value>" +
    "</param>" +
    "<param>" +
    "<value><string>OS Test User Agent</string></value>" +
    "</param>" +
    "</params>" +
    "</methodCall>";
  var xmlTest = "<methodCall>" +
    "<methodName>ServerInfo</methodName>" +
    "</methodCall>";
  console.log(xmlTest);



  var postRequest = {
    host: 'api.opensubtitles.org',
    port: 80,
    path: "/xml-rpc",
    method: 'POST',
    headers: {
        'Content-Type': 'text/xml',
        'Content-Length': Buffer.byteLength(xmlTest)
    }
  };

  var buffer = '';
  var req = http.request( postRequest, function( res )    {

    console.log(res);
    console.log( res.statusCode );
    buffer = "";
    res.on( "data", function( data ) { buffer = buffer + data; } );
    res.on( "end", function( data ) { console.log( buffer ); } );
  });

  // req.write(xmlTest);
  // req.end();
}

