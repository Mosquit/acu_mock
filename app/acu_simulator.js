var net = require('net');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);



var current_consist = new Array();




app.get('/', function(req, res){
  res.sendFile('html/consist_status.html', {"root": __dirname});
});

http.listen(44444, function(){
  console.log('listening on *:44444');
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
	get_history().forEach( function (element, index, array ) {console.log("sending " + element); io.emit('history', element);} );
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
	io.emit('history', format_history_msg(json_msg));
	add_command_to_history(format_history_msg(json_msg));
}

var last_command_seqnum = 0;
var history_size = 20;
var history_array = new Array()

var a = get_history();
console.log(a);


function format_history_msg (msg) {
		var str = "--> Consist with " + msg.config.car_count + " cars received.";
		return str;
}

function add_command_to_history (msg)  {
		history_array[last_command_seqnum++ % history_size] = msg;
}

function get_history() {
	var last_commands = Array();
	var idx = (last_command_seqnum - history_size) > 0 ? (last_command_seqnum - history_size) : 0;
	for (; idx < last_command_seqnum; idx++) {
		last_commands.push(history_array[idx % history_size]);
	}
	return last_commands;
}
