const archiver = require('archiver');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const Component = require('../models/Component');
const Dependency = require('../models/Dependency');
const tmp = require('tmp');
const del = require('del');

class CustomVisualizationManager {

    constructor(absoluteBasePath, relativeCodePath, relativeSchemaPath, relativeBaseFolder, usernameToken, type) {
        this.absoluteBasePath = absoluteBasePath;
        this.relativeCodePath = relativeCodePath;
        this.relativeSchemaPath = relativeSchemaPath;
        this.relativeBaseFolder = relativeBaseFolder;
        this.usernameToken = usernameToken;
        this.type = type;
    }

    generateCardBundle(username, ids, filename, callback) {
        var type = this.type;
        var schemasPath = path.join(this.absoluteBasePath, this.relativeSchemaPath.replace(this.usernameToken, username));
        var bundlePath = path.join(this.absoluteBasePath, this.relativeBaseFolder.replace(this.usernameToken, username), filename);
        var libsPath = path.join(this.absoluteBasePath, "uploads", username, "lib");
        var previewPath = path.join(this.absoluteBasePath, "uploads", username, "preview");
        var filter = {
            username: username,
            type: type
        };

        if(ids.length > 0){
            filter.id = {$in: ids}
        }

        fs.readdir(schemasPath, (err, files) => {
            Component.find(filter, "schemaFileName libs previewFileName").exec((err, components) => {
                let libs = [];
                let previews = [];
                let componentsFiles = components.map((component) => {
                    libs = libs.concat(component.libs);
                    previews.push(component.previewFileName);
                    return component.schemaFileName;
                });
                let depenedencySchemaPath = path.join("dependency", 'schemas.json');
                let bundleSchema = {
                    previews: [],
                    dependencies: [],
                    dependenciesSchema: depenedencySchemaPath,
                    cards: []
                };

                previews = previews.filter((previewName, i) => {
                    return previews.indexOf(previewName) === i && previewName !== undefined && previewName !== null;
                });

                libs = libs.filter((libName, i) => {
                    return libs.indexOf(libName) === i;
                });

                let schemaFiles = files.filter(function (filename) {
                    return componentsFiles.indexOf(filename) !== -1;
                });

                let outputStream = fs.createWriteStream(bundlePath);
                let archive = archiver('zip', {zlib: {level: 9}});

                outputStream.on('close', function () {
                    console.log('#CardManager written file: ');
                    callback(bundlePath);
                });

                outputStream.on('end', function () {
                    console.log('#CardManager drain');
                });

                archive.on('error', function (err) {
                    console.log('#CardManager error: ' + err);
                });

                archive.pipe(outputStream);
                schemaFiles.forEach(function (filename) {
                    bundleSchema.cards.push(filename);
                    archive.file(path.join(schemasPath, filename), {name: filename});
                });

                libs.forEach(function (filename) {
                    let rPath = path.join('dependency', filename);
                    bundleSchema.dependencies.push(rPath);
                    archive.file(path.join(libsPath, filename), {name: rPath});
                });

                previews.forEach(function (filename) {
                    let rPath = path.join('preview', filename);
                    bundleSchema.previews.push(rPath);
                    archive.file(path.join(previewPath, filename), {name: rPath});
                });

                archive.append(JSON.stringify(bundleSchema), {name: "schema.json"});

                Dependency.find({username: username}).select({
                    username: 0,
                    id: 0,
                    _id: 0,
                    __v: 0
                }).exec((err, libFiles) => {
                    archive.append(JSON.stringify(libFiles), {name: depenedencySchemaPath});
                    archive.finalize();
                });


            });
        });

    }

    //TODO: should check magic numbers instead, make async
    addCardBundle(filePath, username) {
        let targetPath = path.join(this.absoluteBasePath, this.relativeSchemaPath.replace(this.usernameToken, username));
        let extractedFiles = [];
        let zip = new AdmZip(filePath);
        let zipEntries = zip.getEntries();

        zipEntries.forEach(function (zipEntry) {
            if (!zipEntry.isDirectory) {
                zip.extractEntryTo(zipEntry, targetPath, false, true);
                extractedFiles.push(path.join(targetPath, zipEntry.entryName));
            }
        });

        console.log("#CardManager - Extracted: [" + extractedFiles.join(', ') + "] to " + targetPath);
        return extractedFiles;
    }

    processFolder(folderPath, username, callback) {
        var self = this;
        var folderDescriptor = {previews: [], dependencies: [], cards: []};
        let schema = JSON.parse(fs.readFileSync(path.join(folderPath, "schema.json")))
        schema.previews.forEach(function (previewPath) {
            folderDescriptor.previews.push(previewPath);
            fs.renameSync(path.join(folderPath, previewPath), path.join(self.absoluteBasePath, 'uploads', username, 'preview', path.basename(previewPath)));
        });

        schema.dependencies.forEach(function (dependencyPath) {
            fs.renameSync(path.join(folderPath, dependencyPath), path.join(self.absoluteBasePath, 'uploads', username, 'lib', path.basename(dependencyPath)));
        });

        let dependenciesSchema = JSON.parse(fs.readFileSync(path.join(folderPath, schema.dependenciesSchema)));
        //TODO: unique ids handling
        dependenciesSchema.forEach(function (dependencySchema) {
            folderDescriptor.dependencies.push(dependencySchema);
            let update = dependencySchema;
            let options = {upsert: true, new: true, setDefaultsOnInsert: true};
            Dependency.findOneAndUpdate({username: username, id: dependencySchema.filename}, update, options, (err, dependency) => {
                if (err) console.log(err);
            });
        });

        var i = 0;
        var maxLength = schema.cards.length;
        function resCallback(pathToLoad, schema) {
            folderDescriptor.cards.push({path: pathToLoad, schema: schema});
            i++;
            if (i === maxLength) callback(folderDescriptor);
        }

        schema.cards.forEach(function (cardPath) {
            self.loadCard(path.join(folderPath, cardPath), username, resCallback);
        });
    }

    loadCard(schemaPath, username, callback) {
        var schemaFileName = path.basename(schemaPath);
        var schema = JSON.parse(fs.readFileSync(schemaPath));
        this.generateCard(schemaFileName, schema, username, callback);
        fs.renameSync(schemaPath,
            path.join(this.absoluteBasePath, this.relativeSchemaPath.replace(this.usernameToken, username),
            path.basename(schemaPath)));
    }

    loadFileList(username, pathList, callback) {
        var self = this;
        tmp.dir({
            dir: path.join(this.absoluteBasePath, 'uploads', username),
            prefix: "_tmp"
        }, (err, tempPath, removeTempDir) => {
            if (err) throw err;
            let finalPaths = [];
            let folderDescriptors = [];
            pathList.forEach(function (filePath, i) {
                let zip = new AdmZip(filePath);
                let destFolder = path.join(tempPath, i + "");
                zip.extractAllTo(destFolder, true);
                finalPaths.push(destFolder);
            });

            var i = 0;

            function resCallback(folderDescriptor) {
                folderDescriptors.push(folderDescriptor);
                i++;
                if (i === pathList.length) {
                    callback(folderDescriptor);
                    del(path.join(tempPath,'*')).then(() =>{
                        removeTempDir();
                    });
                }
            }

            finalPaths.forEach(function (path) {
                self.processFolder(path, username, resCallback);
            });

        });
    }

    removeCards(username, ids) {
        let self = this;
        let schemaPath = path.join(this.absoluteBasePath, this.relativeSchemaPath.replace(this.usernameToken, username));
        let codePath = path.join(this.absoluteBasePath, this.relativeCodePath.replace(this.usernameToken, username));
        let correctlyRemovedIds = [];
        ids.forEach((id) => {
            Component.findOneAndRemove({
                    username: username, id: id, type: self.type
                },
                "schemaFileName codeFileName").exec((err, component) => {
                if (err || !component) console.log(err);
                else {
                    fs.unlink(path.join(codePath, component._doc.codeFileName), (err) => {
                        fs.unlink(path.join(schemaPath, component._doc.schemaFileName), (err) => {
                        });
                    });
                }
            });
            correctlyRemovedIds.push(id);
        });
        console.log("#CardManager - Removed cards with ids: " + correctlyRemovedIds.join(', '));
        return correctlyRemovedIds;
    }

}

module.exports = CustomVisualizationManager;