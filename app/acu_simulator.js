var net = require('net');
var express = require('express')
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const MSG_CORRUPTED = -10;
const STRUCTURE_CORRUPTED = -11;

var current_consist = new Array();

var acu_state = {
  etw_status : false,
  live_pa_status : false,
  intra_crew_status : false,
};

var door_open_status = false;

// helper function to decide how many Services is currently in use
function count_services() {
  var cnt = 0;
  Object.keys(acu_state).forEach( function (element, index, array ) {
    if (acu_state[element] == true) cnt++;
  });
  return cnt;
}

app.use( express.static( __dirname + '/html' ));

app.get('/', function(req, res){
  res.sendFile('html/consist_status.html', {"root": __dirname});
  //res.sendFile( path.join( __dirname, 'html', 'consist_status.html' ));
});

http.listen(44444, function(){
  console.log('Webserver listening on *:44444');
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


// Hanle periodical sendings
var door_interval = setInterval(function () {
    console.log('second passed');
}, 5000);




io.on('connection', function(socket){
	console.log("Webclient connected");
  io.emit('data', current_consist);
	get_history().forEach( function (element, index, array ) {
    console.log("sending " + format_history_msg(element));
    io.emit('history', format_history_msg(element));
  } );



  socket.on('checkbox_change', function(data){
    if(!data || !data.element) {
      console.log ("Error while receiving Checkbox change from webapp");
      return;
    }
    //console.log ("Element clicked = " + data.element + ", value  = " + data.value);
    switch(data.element) {
      case "sw_livepa":
        acu_state.live_pa_status = data.value;
        interruption_value_changed(data.value);
        break;
      case "sw_etw":
        acu_state.etw_status = data.value;
        interruption_value_changed(data.value);
        break;
      case "sw_ic":
        acu_state.intra_crew_status = data.value;
        interruption_value_changed(data.value);
        break;
      case "sw_doors_open":
        door_open_status = data.value;
        send_doors_msg(data.value);
        break;
      default:
        console.log("Unknown checkbox element");
        return;
    }
    //console.log("Now " + count_services() + " is ON, new bool value = " + data.value );

    // internal state has changed, shall trigger message to OBISc

  });

});

function interruption_value_changed(newVal) {
  send_services_usage_msg();

  if(newVal == true && count_services() == 1) {
    acu_interrupted();
  } else if (newVal == false && count_services() == 0) {
    send_channel_msg("free");
  }

}

function send_doors_msg(open) {
  console.log("doors are now open ? " + open );
  clearInterval(door_interval);
  door_interval =  setInterval(function () {
      console.log('second passed');
  }, 5000);
}

function send_services_usage_msg() {
  //console.log("Sending msgs usage");
}

function acu_interrupted() {
  //console.log ("ACU is now not prepared");
  send_channel_msg("busy");

  if(acu_state.playing == true) {
    //current playing must be cancelled
    send_play_interrupt_msg();
  }
}

function send_play_interrupt_msg() {
  console.log("Sending unsuccessful playing msg");
}

function send_channel_msg(status) {
  console.log("Sending channel status = " + status)
}

server.listen(33333, '127.0.0.1');

function processMsg(json_msg) {

  errArr = new Array();

  if(checkMsgStructure(json_msg, errArr) == STRUCTURE_CORRUPTED) {
    errArr.forEach(function (element, index, array ) {
      console.log("Error: " + element);
    });
    return MSG_CORRUPTED;
  }


	console.log("There is " + json_msg.config.car_count + " cars in consist" );
	current_consist = json_msg.config.car;
	io.emit('data', current_consist);
  msg = new Object();
  msg.content = json_msg;
  msg.time = new Date();
	io.emit('history', format_history_msg(msg));
	add_command_to_history(msg);
}

var last_command_seqnum = 0;
var history_size = 20;
var history_array = new Array()

var a = get_history();
console.log(a);


function format_history_msg (msg) {
		var str = msg.time.toISOString() + ": --> Consist with " + msg.content.config.car_count + " cars received.";
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

function checkMsgStructure(json_msg, errorArr) {
  if (!json_msg.config || !json_msg.config.car_count || !json_msg.config.car) {
    errorArr.push("Invalid structure");
    return STRUCTURE_CORRUPTED;
  }
}
