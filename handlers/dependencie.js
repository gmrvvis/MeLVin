let path = require('path');
let fs = require('fs');
let Dependency = require('../models/Dependency');
const {promisify} = require('util');
const unlinkFileAsync = promisify(fs.unlink);

module.exports = function (basedir, socket) {
    let username = socket.client.request.user.username;

    socket.on('Dependency.params', function (fileName, properties) {
        let update = properties;
        update.configured = true;
        let options = {upsert: true, new: true, setDefaultsOnInsert: true};
        Dependency.findOneAndUpdate({
            username: username,
            id: fileName,
        }, update, options, (err, dependency) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log("Updated dependency properties");
            Dependency.find({username: username}).select({
                username: 0,
                id: 0,
                _id: 0
            }).exec((err, libFiles) => {
                if (err) {
                    console.log(err);
                    return;
                }
                socket.emit("Dependency.list", libFiles);
            });
        });
    });


    socket.on('Dependency.list', function () {
        Dependency.find({username: username}).select({
            username: 0,
            id: 0,
            _id: 0
        }).exec((err, libFiles) => {
            if (err) {
                console.log(err);
                return;
            }
            socket.emit("Dependency.list", libFiles);
        });
    });

    socket.on('Dependency.remove', (fileNameList) => {

        let fileRemovals = [];

        if (fileNameList.length > 0) {
            fileNameList.forEach((filename) => {
                let filePath = path.join(basedir, 'uploads', username, 'lib', filename);
                unlinkFileAsync(filePath).then(err => {
                        if (err) console.log(username + ' failed to remove file: ' + filename + " with error: " + err.message);
                        console.log(username + ' removed file: ' + filename + " correctly.");
                    }
                );
                fileRemovals.push(Dependency.findOneAndRemove({username: username, filename: filename}));

            });

            Promise.all(fileRemovals)
                .then(() => {
                    Dependency.find({username: username}).select({
                        username: 0,
                        id: 0,
                        _id: 0
                    }).exec((err, libFiles) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        socket.emit("Dependency.list", libFiles, {
                            category: 0,
                            title: "Correctly removed specified files!",
                            description: "The files: " + fileNameList.join(', ') + " were correctly removed"
                        });
                    });
                });
        }
        else {
            let dirPath = path.join(basedir, 'uploads', username, 'lib');
            fs.readdir(dirPath, (err, files) => {
                if (err) throw err;
                files.forEach((filename) => {
                    unlinkFileAsync(path.join(dirPath, filename)).then(err => {
                            if (err) console.log(username + ' failed to remove file: ' + filename + " with error: " + err.message);
                            console.log(username + ' removed file: ' + filename + " correctly.");
                        }
                    );
                    fileRemovals.push(Dependency.findOneAndRemove({username: username, filename: filename}));
                });

                Promise.all(fileRemovals)
                    .then(() => {
                        Dependency.find({username: username}).select({
                            username: 0,
                            id: 0,
                            _id: 0
                        }).exec((err, libFiles) => {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            socket.emit("Dependency.list", libFiles, {
                                category: 0,
                                title: "Correctly renamed files!",
                                description: "All data files have been removed correctly"
                            });
                        });
                    });
            });
        }
    });

};