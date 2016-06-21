/*
In the node.js intro tutorial (http://nodejs.org/), they show a basic tcp
server, but for some reason omit a client connecting to it.  I added an
example at the bottom.

Save the following server in example.js:
*/

var net = require('net');

var server = net.createServer(function(socket) {
	socket.write('Echo server\r\n');
  socket.write('How are you?\r\n');
  //console.log("wrote")
	//socket.pipe(socket);
  //console.log("piped")

  socket.on('data', function(data) {
  	console.log('On server received: ' + data);
  });

  socket.on('error', function(err) {
   console.log(err)
})

});

server.listen(33333, '127.0.0.1');
