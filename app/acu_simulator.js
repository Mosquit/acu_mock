var net = require('net');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);



var current_consist = new Array();




app.get('/', function(req, res){
  res.sendFile('html/consist_status.html', {"root": __dirname});
});

http.listen(44444, function(){
  console.log('listening on *:3000');
});

var server = net.createServer(function(socket) {

	socket.on('data', function(data) {
			var receivedJSON = JSON.parse(data);
			processMsg(receivedJSON);

	});

	socket.on('error', function(err) {
	   console.log(err)
	})
});


io.on('connection', function(socket){
	console.log("Webclient connected");
  io.emit('data', current_consist);
	console.log("Webclient connected");
});

server.listen(33333, '127.0.0.1');

function processMsg(json_msg) {

if (!json_msg.config || !json_msg.config.car_count || !json_msg.config.car) {
	console.log ("Invalid structure");
	return;
}
console.log("There is " + json_msg.config.car_count + " cars in consist" );
current_consist = json_msg.config.car;
io.emit('data', current_consist);
//debugger;
}
