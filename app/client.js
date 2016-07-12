fs = require('fs');
var net = require('net');

var client = new net.Socket();

var input_file, hostname, port;
process.argv.forEach(function (val, index, array) {

  if(array.length < 3) {
      showHelp();
      process.exit()
  }

  switch (index) {
		case 2: input_file = val; break;
		case 3: hostname = val; break;
		case 4: port = val; break;
	}
});

hostname = hostname || '127.0.0.1';
port = port || 33333;


fs.readFile(input_file, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  console.log(data);

	client.connect(port, hostname, function() {
		console.log('Connected');
		client.write(data);
		client.destroy();
	});

/*
	client.on('data', function(data) {
		console.log('Received: ' + data);
		client.destroy(); // kill client after server's response
	});
*/
	client.on('close', function() {
		console.log('Connection closed');
	});




});

function showHelp() {
  console.log("Usage: appName filename_to_send [destination hostname] [destination port]");
  console.log("E.g. node client.js my_file.txt 8.8.8.8 1024");
  console.log("Default = localhost:33333");
}
