var net = require('net');
var server = new net.Server();
var clients = {};
var spawn = require("child_process").spawn;
var fs = require('fs');
var serverConfig = JSON.parse(fs.readFileSync('config.json'));


server.on('connection', function (socket) {

    socket.setEncoding('utf8');
    console.log('Client connected');

    socket.on('data', function (data) {
        var msgObject = JSON.parse(data);
        switch (msgObject.type) {
            case 'init':
                clients[msgObject.username] = {username: msgObject.username, socket: socket};

                var sendResponse = function (err) {
                    console.log("RServer said: "+err);
                    if(err){
                        socket.write(JSON.stringify({type: 'ERROR'}))
                    }
                    else{
                        socket.write(JSON.stringify({type: 'DONE'}))
                    }

                };

                var rProcess = spawn('Rscript',["./modules/R/Worker.R", msgObject.username, msgObject.jobId]);

                rProcess.stdout.on('data', function (data){
                    console.log(data.toString());
                });

                rProcess.stderr.on('data', function(data) {
                    console.error(data.toString());
                });

                rProcess.on('exit', sendResponse);

                break;
        }
    });

    socket.on('error', function () {
        console.log('Socket error!');
    });
});

server.listen(serverConfig.rServerPort, 'localhost', function () {
    console.log('Script server listening on port: '+serverConfig.rServerPort);
});