const http = require('http');

http.createServer(function (req, res) {
	res.write("On the way to be a full stack engineer!");
	res.end();
}).listen(4000);

console.log("Server started on port 4000");
