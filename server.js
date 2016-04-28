require('./config/' + process.env.NODE_ENV);
require('./db');
var app = require('./app')();
var http = require('http');
var logger = require('./libs/log')(module);

var port = process.env.PORT || '80';

var server = http.createServer(app).listen(port);

server.on('error', onError);
server.on('listening', onListening);


function onError(error) {
    logger.error(error);
}

function onListening() {
    logger.info('Server started at http://localhost:' + port + '/');
}
