fs = require('fs');
var net = require('net');

var client = new net.Socket();

var input_file, hostname, port;
process.argv.forEach(function (val, index, array) {
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
