let Component = require('../models/Component');
let Dependency = require('../models/Dependency');
let Session = require('../models/Session');
let Connection = require('../models/Connection');
let path = require('path');
let fs = require('fs');
let sessionSkeleton = require('./sessionSkeleton');

module.exports = function (basedir, sessionManager, socket) {
    let username = socket.client.request.user.username;
    socket.on('Session.init', function () {
        Session.find({username: username})
            .select({title: 1, description: 1, lastModified: 1, id: 1, _id: 0})
            .sort({lastModified: -1})
            .exec(function (err, sessions) {

                if (err) {
                    console.error("Failed to load session list from user: " + username + " err: " + err);
                    return;
                }

                console.log("INIT: " + JSON.stringify(sessions));

                let dataFiles = {folders:{}, files:{}};
                let previewFiles = [];

                //TODO: remove async cascade
                let dirPath = path.join(basedir, 'uploads', username, 'data');
                fs.readdir(dirPath, function (err, folderContent) {
                    if (err) throw err;

                    // dataFiles = folderContent.map(function (name) {
                    //     return {fs.lstatSync(path.join(dirPath, name)).isFile()
                    // });

                    // folderContent.map(function (filePath){return
                    //     let relFilePath = filePath.substring(file_path.search("data")+5);
                    //     let dirName = path.dirname(relFilePath);
                    //     if (dirName === '.'){
                    //         return {name: relFilePath, isFolder: false}
                    //     }
                    //     else{
                    //         return {name: relFilePath, isFolder: false}
                    //     }
                    // })

                    folderContent.forEach(function (name) {
                        if (fs.lstatSync(path.join(dirPath, name)).isFile())
                            dataFiles.files[name] = {name: name, isFolder: false}
                        else {
                            let files = {}
                            fs.readdirSync(path.join(dirPath, name)).forEach(function (file) {
                                files[file] = {name: file, isFolder: false}
                            })
                            dataFiles.folders[name] = {name: name, isFolder: true, files: files}
                        }
                    });

                    let vizPath = path.join(basedir, 'uploads', username, 'customCards', 'visualizations', 'js');
                    fs.readdir(vizPath, function (err, vizFolderContent) {
                        let vizFiles = [];
                        vizFolderContent.forEach(function (file) {
                            if (file.split('.').pop() === 'js')
                                vizFiles.push(path.join('auth', 'visualizations', 'js', file));
                        });
                        Dependency.find({username: username}).select({
                            username: 0,
                            id: 0,
                            _id: 0
                        }).exec((err, libFiles) => {
                            if (err) console.log(err);


                            let previewPath = path.join(basedir, 'uploads', username, 'preview');
                            fs.readdir(previewPath, function (err, folderContent) {
                                if (err) console.log(err);

                                previewFiles = folderContent.filter(function (name) {
                                    return fs.lstatSync(path.join(previewPath, name)).isFile()
                                });

                                Component.find({username: username}).select({
                                    username: 0,
                                    id: 0,
                                    _id: 0
                                }).exec(function (err, vizSchemas) {
                                    Connection.find({username: username}).select({
                                        username: 0,
                                        id: 0,
                                        _id: 0
                                    }).exec(function (err, connSchemas) {
                                        socket.emit("Session.init", {
                                            sessions: sessions,
                                            dataFiles: dataFiles,
                                            libFiles: libFiles,
                                            previewFiles: previewFiles,
                                            vizFiles: vizFiles,
                                            vizSchemas: vizSchemas,
                                            connSchemas: connSchemas
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
    });

    socket.on('Session.remove', function (id) {
        console.log("Remove session: " + id + " for username: " + username);
        Session.deleteOne({username: username, id: id}, function (err) {
            if (err) return console.log("Error deleting " + id + " for " + username + " - error: " + err);
            Session.find({username: username})
                .select({title: 1, description: 1, lastModified: 1, id: 1, _id: 0})
                .sort({lastModified: -1})
                .exec(function (err, sessions) {
                    socket.emit("Session.reloadSessionList", {
                        sessions: sessions
                    });
                });
        });
    });

    socket.on('Session.add', function (data) {
        let date = new Date();
        let dateNow = date.getTime();
        let update = {description: data.description, title: data.title, lastModified: dateNow};
        let options = {upsert: true, new: true, setDefaultsOnInsert: true};
        Session.findOneAndUpdate({username: username, id: data.id}, update, options, function (err, session) {
            if (err) {
                console.error("Failed session saving for user: " + username);
                return;
            }

            console.log(JSON.stringify(session));
            if (!session.data) {
                session.data = JSON.stringify(sessionSkeleton);
                session.save(function (err) {
                    if (err)
                        console.error("Failed session data init for user: " + username + " - error: " + err);
                })
            }

            Session.find({username: username})
                .select({title: 1, description: 1, lastModified: 1, id: 1, _id: 0})
                .sort({lastModified: -1})
                .exec(function (err, sessions) {
                    socket.emit("Session.reloadSessionList", {
                        sessions: sessions
                    });
                });
        });

    });

    socket.on('Session.save', function (data) {
        console.log('Save session');
        let session = data.session;
        console.log(session);
        let id = data.id;
        let date = new Date();
        let update = {data: session, id: id, lastModified: date.getTime()};
        let options = {upsert: true, new: true, setDefaultsOnInsert: true};
        Session.findOneAndUpdate({username: username, id: id}, update, options, function (err, session) {
            if (err) {
                console.error("Failed session saving for user: " + username);
                return;
            }
        })
    });

    socket.on('Session.load', function (id) {
        Session.findOne({username: username, id: id}, {_id: 0}, (err, session) => {
            if (err) {
                console.error("Failed to load session from user: " + username);
                return;
            }
            if (session !== null)
                socket.emit("Workspace.load", {
                    session: session.data,
                    id: id
                });
        });
    });

    socket.on('Session.download', function (id) {
        sessionManager.generateSessionBundle(username, id, "SessionBundle.zip", () => {
            socket.emit('Session.download', './auth/sessions/SessionBundle.zip')
        })
    });
};