let path = require('path');
let fs = require('fs');
let net = require('net');
let Job = require('../models/Job');
var serverConfig = JSON.parse(fs.readFileSync('config.json'));

module.exports = function (basedir, socket) {
    let username = socket.client.request.user.username;

    socket.on('Work.start', function (jobData) {
        let jobId = jobData.id.split('/').pop();
        console.log("User: " + username + " wants " + jobId + " to be started in " + jobData.type + ".");

        let workServerSocket = net.connect(jobData.type === 'python' ? serverConfig.pythonServerPort : serverConfig.rServerPort);
        workServerSocket.on('connect', function (data) {
            console.log("Client: ", data)
        });
        //TODO: close connection
        workServerSocket.on('data', function (data) {
            var parsedData = JSON.parse(data);
            console.log("Server said:", parsedData);
            switch (parsedData.type) {
                case 'DONE':
                    socket.emit("Work.done", jobId);
                    Job.findOne({username: username, id: jobId}, function (err, job) {
                        if (err) {
                            console.error("Failed job addition for user: " + username);
                        } else {
                            fs.unlink(job.state, function (err) {

                            });
                            fs.unlink(job.input, function (err) {

                            });
                            fs.unlink(job.dataPath, function (err) {

                            });
                            fs.unlink(job.schemaPath, function (err) {

                            });
                            fs.unlink(job.operationList, function (err) {

                            });
                            job.changes.forEach(function (change) {
                                fs.unlink(change, function (err) {

                                });
                            });
                        }

                    });

                    break;
                case 'ERROR':
                    socket.emit("Work.failed", jobId);
            }
        });
        console.log("Sending work to microservice");
        workServerSocket.write(JSON.stringify({type: 'init', username: username, jobId: jobId}));
    });
};