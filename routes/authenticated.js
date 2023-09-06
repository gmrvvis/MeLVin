module.exports = function (baseDir, storage, socketList, customVizManager, customCardManager, sessionManager) {

    let express = require('express');
    let router = express.Router();
    let path = require('path');
    let fs = require('fs');
    let multer = require('multer');
    let upload = multer({storage: storage});
    let Component = require('../models/Component');
    let Dependency = require('../models/Dependency');
    let Session = require('../models/Session');
    let Job = require('../models/Job');
    let Connection = require('../models/Connection');
    let crypto = require('crypto');

    router.post('/jobs', function (req, res) {
        let username = req.user.username;
        let date = new Date();
        let options = {upsert: true, new: true, setDefaultsOnInsert: true};
        let id = crypto.createHash('md5').update(date.getMilliseconds() + username).digest('hex');
        let update = {
            operationList: "", changes: [], resultPath: path.join(baseDir, "uploads", username, "temp", id),
            codePath: path.join(baseDir, "uploads", username, "customCards", "functional", "js", req.query.id)
        };
        Job.findOneAndUpdate({username: username, id: id}, update, options, function (err) {
            if (err) {
                console.error("Failed session saving for user: " + username);
                res.sendStatus(409);
            }
            //FIXME check if location should be returned relative from client perspective or from server one
            res.location("../../jobs/" + id);
            res.sendStatus(201);
        });
    });

    router.post('/jobs/:jobId/operationList', function (req, res) {
        let username = req.user.username;
        let destPath = path.join(baseDir, "uploads", username, "temp", req.params.jobId + "_operationList.json");
        let update = {operationList: destPath};
        let options = {upsert: true, new: true, setDefaultsOnInsert: true};
        Job.findOneAndUpdate({username: username, id: req.params.jobId}, update, options, function (err) {
            if (err) {
                console.error("Failed job addition for user: " + username);
                res.sendStatus(503);
            }
        });
        fs.writeFile(destPath, JSON.stringify(req.body), function (err) {
            if (err)
                res.sendStatus(503);
            else
                res.sendStatus(200);
        });
    });


    router.post('/jobs/:jobId/changes', function (req, res) {
        let username = req.user.username;
        let destPath = path.join(baseDir, "uploads", username, "temp", req.params.jobId + "_change" + req.body.id + ".json");
        Job.findOne({username: username, id: req.params.jobId}, function (err, job) {
            if (err) {
                console.error("Failed job addition for user: " + username);
                res.sendStatus(503);
            }
            job.changes.push(destPath);
            job.save()
        });
        fs.writeFile(destPath, req.body.content, function (err) {
            if (err) res.sendStatus(503);
            res.sendStatus(200);
        });
    });

    router.post('/jobs/:jobId/data', function (req, res) {
        let username = req.user.username;
        let destPath = path.join(baseDir, "uploads", username, "temp", req.params.jobId + "_data.json");
        Job.findOne({username: username, id: req.params.jobId}, function (err, job) {
            if (err) {
                console.error("Failed job addition for user: " + username);
                res.sendStatus(503);
            }
            job.dataPath = destPath;
            job.save()
        });
        fs.writeFile(destPath, JSON.stringify(req.body), function (err) {
            if (err) {
                console.log(err)
                res.sendStatus(503);
            } else {
                res.sendStatus(200);
            }
        });
    });

    router.post('/jobs/:jobId/schema', function (req, res) {
        let username = req.user.username;
        let destPath = path.join(baseDir, "uploads", username, "temp", req.params.jobId + "_schema.json");
        Job.findOne({username: username, id: req.params.jobId}, function (err, job) {
            if (err) {
                console.error("Failed job addition for user: " + username);
                res.sendStatus(503);
            }
            job.schemaPath = destPath;
            job.save()
        });

        fs.writeFile(destPath, JSON.stringify(req.body), function (err) {
            if (err) {
                console.log(err)
                res.sendStatus(503);
            } else {
                res.sendStatus(200);
            }
        });
    });


    router.post('/jobs/:jobId/state', function (req, res) {
        let username = req.user.username;
        let destPath = path.join(baseDir, "uploads", username, "temp", req.params.jobId + "_state.json");
        let update = {state: destPath};
        let options = {upsert: true, new: true, setDefaultsOnInsert: true};
        Job.findOneAndUpdate({username: username, id: req.params.jobId}, update, options, function (err) {
            if (err) {
                console.error("Failed job addition for user: " + username);
                res.sendStatus(503);
            }
        });
        fs.writeFile(destPath, JSON.stringify(req.body), function (err) {
            if (err) res.sendStatus(503);
            res.sendStatus(200);
        });
    });

    router.post('/jobs/:jobId/input', function (req, res) {
        let username = req.user.username;
        let destPath = path.join(baseDir, "uploads", username, "temp", req.params.jobId + "_input.json");
        let update = {input: destPath};
        let options = {upsert: true, new: true, setDefaultsOnInsert: true};
        Job.findOneAndUpdate({username: username, id: req.params.jobId}, update, options, function (err) {
            if (err) {
                console.error("Failed job addition for user: " + username);
                res.sendStatus(503);
            }
        });
        fs.writeFile(destPath, JSON.stringify(req.body), function (err) {
            if (err) res.sendStatus(503);
            res.sendStatus(200);
        });
    });


    router.get('/jobs/:jobId', function (req, res, next) {
        let username = req.user.username;
        let destPath = path.join(baseDir, "uploads", username, "temp", req.params.jobId);
        res.sendFile(destPath, function (err) {
            if (err) {
                next(err);
            } else {
                Job.findOne({username: username, id: req.params.jobId}, function (err, job) {
                    if (err) {
                        console.error("Failed job addition for user: " + username);
                    } else {
                        fs.unlink(job.resultPath, function (err) {
                        });
                        job.remove();
                    }
                });
            }
        });
    });

    router.post('/uploadData', upload.array('files', 10), function (req, res) {
        let username = req.user.username;
        let dirPath = path.join(baseDir, 'uploads', username, 'data');
        fs.readdir(dirPath, function (err, folderContent) {
            if (err) throw err;
            socketList[username].emit("File.list", folderContent, {
                category: 0,
                title: "Correctly uploaded files!",
                description: ""
            });
        });
        res.sendStatus(200);
    });

    router.post('/uploadPreview', upload.array('files', 10), function (req, res) {
        let username = req.user.username;
        let previewFolder = path.join(baseDir, 'uploads', username, 'preview');
        fs.readdir(previewFolder, function (err, folderContent) {
            if (err) throw err;
            socketList[username].emit("Thumbnail.list", folderContent, {
                category: 0,
                title: "Correctly uploaded files!",
                description: ""
            });
        });
        res.sendStatus(200)
    });

    router.post('/uploadLib', upload.array('files', 10), (req, res) => {
        console.log(req.body);
        console.log(req.files);
        let username = req.user.username;
        let dbSaves = [];
        req.files.forEach((file) => {
            let filePath = path.join(baseDir, file.path);
            let stat = fs.lstatSync(filePath);
            let update = {
                configured: false,
                filename: path.basename(filePath),
                name: path.basename(filePath),
                size: stat.size,
                version: "Not defined",
                defaultID: "Not defined",
                uniqueID: "Not defined",
                order: 0
            };
            let options = {upsert: true, new: true, setDefaultsOnInsert: true};
            dbSaves.push(Dependency.findOneAndUpdate({
                username: username,
                id: path.basename(filePath),
            }, update, options))
        });

        Promise.all(dbSaves)
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
                    socketList[username].emit("Dependency.list", libFiles, {
                        category: 0,
                        title: "Correctly renamed files!",
                        description: "All data files have been removed correctly"
                    });
                });
            });

        res.sendStatus(200)
    });

    router.post('/uploadConnection', upload.array('files', 10), (req, res) => {
        console.log(req.body);
        console.log(req.files);
        let username = req.user.username;
        let dbSaves = [];
        req.files.forEach((file) => {
            let filePath = path.join(baseDir, file.path);
            let fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            let options = {upsert: true, new: true, setDefaultsOnInsert: true};
            dbSaves.push(Connection.findOneAndUpdate({
                username: username,
                property: fileContent.property,
            }, fileContent, options))
        });

        Promise.all(dbSaves)
            .then(() => {
                Connection.find({username: username}).select({
                    username: 0,
                    id: 0,
                    _id: 0
                }).exec(function (err, connSchemas) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    socketList[username].emit("Connection.list", connSchemas, {
                        category: 0,
                        title: "Correctly uploaded",
                        description: "All connections have been successfully uploaded"
                    });
                });
            });

        res.sendStatus(200)
    });

    router.post('/uploadViz', upload.array('files', 10), (req, res) => {
        let username = req.user.username;
        let filesPath = req.files.map((file) => {
            return file.path;
        });

        customVizManager.loadFileList(username, filesPath, (importDescription) => {
            socketList[username].emit('Visualization.refresh', importDescription, {
                category: 0,
                title: "Correctly imported visualizations!",
                description: ""
            });
        });

        res.sendStatus(200)
    });


    router.post('/uploadSession', upload.array('files', 10), (req, res) => {
        let username = req.user.username;
        let filesPath = req.files.map((file) => {
            return file.path;
        });

        filesPath.forEach((filePath) => {
            sessionManager.importSessionBundle(username, filePath, () => {
                Session.find({username: username})
                    .select({title: 1, description: 1, lastModified: 1, id: 1, _id: 0})
                    .sort({lastModified: -1})
                    .exec(function (err, sessions) {
                        socketList[username].emit("Session.reloadSessionList", {
                            sessions: sessions
                        });
                    });
            });
        })


        res.sendStatus(200)
    });

    router.post('/uploadWorker', upload.array('files', 10), (req, res) => {
        let username = req.user.username;


        let filesPath = req.files.map((file) => {
            return file.path;
        });

        customCardManager.loadFileList(username, filesPath, (importDescription) => {
            socketList[username].emit('Card.refresh', importDescription, {
                category: 0,
                title: "Correctly imported processing cards!",
                description: ""
            });
        });


        res.sendStatus(200)
    });

    router.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    router.get("/", function (req, res) {
        res.render('auth');
    });

    router.get("/files/:folder/:filename", function (req, res) {
        let folder = req.params.folder === 'root' ? "" : req.params.folder
        res.sendFile(path.join(baseDir, 'uploads', req.user.username, 'data', folder, req.params.filename));
    });

    router.get("/connections/:property", function (req, res) {
        let filter = {
            username: req.user.username,
            property: req.params.property
        };

        Connection.find(filter).select({
            username: 0,
            id: 0,
            _id: 0,
            __v: 0
        }).exec((err, components) => {
            res.header("Content-Type", 'application/json');
            res.send(JSON.stringify(components[0]));
        });
    });

    router.get("/visualizations/:filename", function (req, res) {
        res.sendFile(path.join(baseDir, 'uploads', req.user.username, 'customCards', 'visualizations', req.params.filename));
    });

    router.get("/visualizations/js/:filename", function (req, res) {
        res.sendFile(path.join(baseDir, 'uploads', req.user.username, 'customCards', 'visualizations', 'js', req.params.filename));
    });

    router.get("/visualizations/schemas/:filename", function (req, res) {
        Component.findOne({
            username: req.user.username,
            id: req.params.filename,
            type: "v"
        }, "schemaFileName").exec((err, component) => {
            if (err || !component) res.sendStatus(404);
            else
                res.sendFile(path.join(baseDir, 'uploads', req.user.username, 'customCards', 'visualizations', 'schemas', component._doc.schemaFileName));
        });
    });

    router.get("/previews/:filename", function (req, res) {
        res.sendFile(path.join(baseDir, 'uploads', req.user.username, 'preview', req.params.filename));
    });

    router.get("/libs/:filename", function (req, res) {
        res.sendFile(path.join(baseDir, 'uploads', req.user.username, 'lib', req.params.filename));
    });

    router.get("/workers/:filename", function (req, res) {
        res.sendFile(path.join(baseDir, 'uploads', req.user.username, 'customCards', 'functional', req.params.filename));
    });

    router.get("/workers/js/backendWorker.js", function (req, res) {
        res.sendFile(path.join(baseDir, 'auth', 'js', 'src', 'workers', 'BackendScriptWorker.js'));
    });

    router.get("/workers/js/genericWorker.js", function (req, res) {
        res.sendFile(path.join(baseDir, 'auth', 'js', 'src', 'workers', 'Worker.js'));
    });

    router.get("/workers/js/dataInputWorker.js", function (req, res) {
        res.sendFile(path.join(baseDir, 'auth', 'js', 'src', 'workers', 'DataInputWorker.js'));
    });

    router.get("/workers/js/:filename", function (req, res) {
        res.sendFile(path.join(baseDir, 'uploads', req.user.username, 'customCards', 'functional', 'js', req.params.filename));
    });

    router.get("/workers/schemas/:filename", function (req, res) {
        Component.findOne({
            username: req.user.username,
            id: req.params.filename,
            type: "p"
        }, "schemaFileName").exec((err, component) => {
            if (err || !component) res.sendStatus(404);
            else
                res.sendFile(path.join(baseDir, 'uploads', req.user.username, 'customCards', 'functional', 'schemas', component._doc.schemaFileName));
        });
    });

    router.get("/sessions/:filename", function (req, res) {
        res.sendFile(path.join(baseDir, 'uploads', req.user.username, req.params.filename));
    });


    return router;
};