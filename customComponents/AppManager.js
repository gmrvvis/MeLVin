var archiver = require('archiver');
var AdmZip = require('adm-zip');
var fs = require('fs');
var path = require('path');
var Session = require('../models/Session');
var VisualizationCardManager = require('./VisualizationCardManager');
var ProcessingCardManager = require('./ProcessingCardManager');
const tmp = require('tmp');

class AppManager {

    constructor(absoluteBasePath, relativeCodePath, relativeSchemaPath, relativeBasePath, relativeCardCodePath, relativeCardSchemaPath, relativeCardBasePath, usernameToken) {
        this.absoluteBasePath = absoluteBasePath;
        this.visualizationManager = new VisualizationCardManager(absoluteBasePath, relativeCodePath, relativeSchemaPath, relativeBasePath, usernameToken, "v")
        this.processingManager = new ProcessingCardManager(absoluteBasePath, relativeCardCodePath, relativeCardSchemaPath, relativeCardBasePath, usernameToken, "p")
    }

    generateSessionBundle(username, sessionID, fileName, callback) {
        var bundlePath = path.join(this.absoluteBasePath, "uploads", username, fileName);
        var vizBundleFileName = "visualizations.zip";
        var procBundleFileName = "processing.zip";
        var self = this;
        Session.findOne({username: username, id: sessionID}).select({
            username: 0,
            _id: 0,
            __v: 0
        }).exec((err, session) => {

            let outputStream = fs.createWriteStream(bundlePath);
            let archive = archiver('zip', {zlib: {level: 9}});

            outputStream.on('close', function () {
                console.log('#CardManager written file: ');
                callback();
            });

            outputStream.on('end', function () {
                console.log('#CardManager drain');
            });

            archive.on('error', function (err) {
                console.log('#CardManager error: ' + err);
            });

            archive.pipe(outputStream);

            let sessionData = JSON.parse(session.data);
            let ids = sessionData.cards.map((card) => {
                return card.type;
            });
            console.log(ids);

            archive.append(JSON.stringify(session), {name: 'session.json'});

            let schema = {
                vizBundleFileName: vizBundleFileName,
                procBundleFileName: procBundleFileName,
                sessionFileName: 'session.json'
            };
            archive.append(JSON.stringify(schema), {name: 'schema.json'});

            self.visualizationManager.generateCardBundle(username, ids, vizBundleFileName, (vizBundlePath) => {
                archive.file(vizBundlePath, {name: vizBundleFileName});
                self.processingManager.generateCardBundle(username, ids, procBundleFileName, (procBundlePath) => {
                    archive.file(procBundlePath, {name: procBundleFileName});
                    archive.finalize();
                });
            });
        });

    }

    //TODO: should check magic numbers instead, make async
    importSessionBundle(username, filePath, endCallback) {
        var self = this;
        tmp.dir({
            dir: path.join(this.absoluteBasePath, 'uploads', username),
            prefix: "_tmp"
        }, (err, tempPath, removeTempDir) => {
            if (err) throw err;
            let zip = new AdmZip(filePath);
            let destFolder = path.join(tempPath);
            let zipEntries = zip.getEntries();
            zip.extractAllTo(destFolder, true);


            fs.readFile(path.join(tempPath, "schema.json"), (err, fileContent) => {
                let sessionBundleSchema = JSON.parse(fileContent);
                let pathViz = path.join(tempPath, sessionBundleSchema.vizBundleFileName);
                let pathProc = path.join(tempPath, sessionBundleSchema.procBundleFileName);
                let sessionPath = path.join(tempPath, sessionBundleSchema.sessionFileName);
                self.visualizationManager.loadFileList(username, [pathViz], (folderDescriptors) => {
                    console.log(folderDescriptors);
                });
                self.processingManager.loadFileList(username, [pathProc],(folderDescriptors) => {
                    console.log(folderDescriptors);
                });
                self.importSession(username, sessionPath, endCallback)
            })


        });
    }

    importSession(username, sessionPath, endCallback) {
        let session = JSON.parse(fs.readFileSync(sessionPath));
        let update = session;
        let options = {upsert: true, new: true, setDefaultsOnInsert: true};
        Session.findOneAndUpdate({username: username, id: session.id}, update, options, (err, session) => {
            if (err) console.log(err);
            endCallback();
        });
    }

}

module.exports = AppManager;