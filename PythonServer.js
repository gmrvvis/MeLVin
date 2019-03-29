var net = require('net');
var server = new net.Server();
var clients = {};
var spawn = require("child_process").spawn;
server.on('connection', function (socket) {

    socket.setEncoding('utf8');
    console.log('Client connected');

    socket.on('data', function (data) {
        var msgObject = JSON.parse(data);
        switch (msgObject.type) {
            case 'init':
                clients[msgObject.username] = {username: msgObject.username, socket: socket};

                var sendResponse = function (err) {
                    console.log("PythonServer said: "+err);
                    if(err){
                        socket.write(JSON.stringify({type: 'ERROR'}))
                    }
                    else{
                        socket.write(JSON.stringify({type: 'DONE'}))
                    }

                };

                var pyProcess = spawn('python',["./modules/Python/Worker.py", msgObject.username, msgObject.jobId]);

                pyProcess.stdout.on('data', function (data){
                    console.log(data.toString());
                });

                pyProcess.stderr.on('data', function(data) {
                    console.error(data.toString());
                });

                pyProcess.on('exit', sendResponse);

                break;
        }
    });

    socket.on('error', function () {
        console.log('Socket error!');
    });
});

server.listen(serverConfig.pythonServerPort, 'localhost', function () {
    console.log('Script server listening on port: '+serverConfig.pythonServerPort);
});