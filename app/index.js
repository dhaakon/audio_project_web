var express = require('express');
var app = express();

var path = require('path');
var fs = require('fs');
var http = require('http');

var server = http.createServer(app);
var port = process.env.PORT || 3000;

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

app.set('port', port );

app.set('port', port);
app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'jade');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(express.static('public'));

server.listen( port, function(){
	routes = require('./routes')(app);
	console.log('SERVER LISTENING ON ' + (port));
});
