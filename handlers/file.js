let path = require('path');
let fs = require('fs');
const {promisify} = require('util');
const unlinkFileAsync = promisify(fs.unlink);

let parseFiles = function (dirPath, folderContent) {
    let fileObj = {folders:{}, files:{}}
    folderContent.forEach(function (name) {
        if (fs.lstatSync(path.join(dirPath, name)).isFile())
            fileObj.files[name] = {name: name, isFolder: false}
        else {
            let files = {}
            fs.readdirSync(path.join(dirPath, name)).forEach(function (file) {
                files[file] = {name: file, isFolder: false}
            })
            fileObj.folders[name] = {name: name, isFolder: true, files: files}
        }
    });

    return fileObj
}

module.exports = function (basedir, socket) {
    let username = socket.client.request.user.username;

    socket.on('File.rename', function (oldFileName, newFileName) {
        let dirPath = path.join(basedir, 'uploads', username, 'data');
        let oldBasename = path.basename(oldFileName);
        let newBasename = path.basename(newFileName) + '.' + oldBasename.split('.').pop();
        fs.rename(path.join(dirPath, oldBasename), path.join(dirPath, newBasename), function (renameErr) {
            if (renameErr) console.log(username + ' failed to rename file: ' + oldBasename);
            console.log(username + ' renamed file: ' + oldBasename + " to " + newBasename + " correctly.");
            fs.readdir(dirPath, function (err, files) {
                if (err) throw err;
                files = parseFiles(dirPath, files)
                socket.emit("File.list", files, {
                    category: 0,
                    title: "Correctly renamed file!",
                    description: "The file '" + oldFileName + "' was correctly renamed to '" + newBasename + "'"
                });
            });
        });
    });


    socket.on('File.list', function () {
        let dirPath = path.join(basedir, 'uploads', username, 'data');
        fs.readdir(dirPath, function (err, files) {
            if (err) throw err;
            files = parseFiles(dirPath, files)
            socket.emit("File.list", files);
        });
    });

    socket.on('File.remove', (fileNameList) => {

        let fileRemovals = [];

        if (fileNameList.length > 0) {
            fileNameList.forEach((filename) => {
                let filePath = path.join(basedir, 'uploads', username, 'data', filename);
                fileRemovals.push(unlinkFileAsync(filePath).then(err => {
                        if (err) console.log(username + ' failed to remove file: ' + filename + " with error: " + err.message);
                        console.log(username + ' removed file: ' + filename + " correctly.");
                    }
                ));
            });

            Promise.all(fileRemovals)
                .then(() => {
                    let dirPath = path.join(basedir, 'uploads', username, 'data');
                    fs.readdir(dirPath, (err, files) => {
                        if (err) throw err;
                        files = parseFiles(dirPath, files)
                        socket.emit("File.list", files, {
                            category: 0,
                            title: "Correctly removed specified files!",
                            description: "The files: " + fileNameList.join(', ') + " were correctly removed"
                        });
                    });
                });
        } else {
            let dirPath = path.join(basedir, 'uploads', username, 'data');
            fs.readdir(dirPath, (err, files) => {
                if (err) throw err;
                files.forEach((filename) => {
                    fileRemovals.push(unlinkFileAsync(path.join(dirPath, filename)).then(err => {
                            if (err) console.log(username + ' failed to remove file: ' + filename + " with error: " + err.message);
                            console.log(username + ' removed file: ' + filename + " correctly.");
                        }
                    ));
                });

                Promise.all(fileRemovals)
                    .then(() => {
                        let dirPath = path.join(basedir, 'uploads', username, 'data');
                        fs.readdir(dirPath, (err, files) => {
                            if (err) throw err;
                            files = parseFiles(dirPath, files)
                            socket.emit("File.list", files, {
                                category: 0,
                                title: "Correctly renamed files!",
                                description: "All data files have been removed correctly"
                            });
                        });
                    });
            });
        }
    });

    socket.on('Thumbnail.rename', function (oldFileName, newFileName) {
        let dirPath = path.join(basedir, 'uploads', username, 'preview');
        let oldBasename = path.basename(oldFileName);
        let newBasename = path.basename(newFileName) + '.' + oldBasename.split('.').pop();
        fs.rename(path.join(dirPath, oldBasename), path.join(dirPath, newBasename), function (renameErr) {
            if (renameErr) console.log(username + ' failed to rename file: ' + oldBasename);
            console.log(username + ' renamed file: ' + oldBasename + " to " + newBasename + " correctly.");
            fs.readdir(dirPath, function (err, files) {
                if (err) throw err;
                socket.emit("Thumbnail.list", files, {
                    category: 0,
                    title: "Correctly renamed file!",
                    description: "The file '" + oldFileName + "' was correctly renamed to '" + newBasename + "'"
                });
            });
        });
    });

    socket.on('Thumbnail.list', function () {
        let dirPath = path.join(basedir, 'uploads', username, 'preview');
        fs.readdir(dirPath, function (err, files) {
            if (err) throw err;
            socket.emit("Thumbnail.list", files);
        });
    });

    socket.on('Thumbnail.remove', (fileNameList) => {

        let fileRemovals = [];

        if (fileNameList.length > 0) {
            fileNameList.forEach((filename) => {
                let filePath = path.join(basedir, 'uploads', username, 'preview', filename);
                fileRemovals.push(unlinkFileAsync(filePath).then(err => {
                        if (err) console.log(username + ' failed to remove file: ' + filename + " with error: " + err.message);
                        console.log(username + ' removed file: ' + filename + " correctly.");
                    }
                ));
            });

            Promise.all(fileRemovals)
                .then(() => {
                    let dirPath = path.join(basedir, 'uploads', username, 'preview');
                    fs.readdir(dirPath, (err, files) => {
                        if (err) throw err;
                        socket.emit("Thumbnail.list", files, {
                            category: 0,
                            title: "Correctly removed specified files!",
                            description: "The files: " + fileNameList.join(', ') + " were correctly removed"
                        });
                    });
                });
        } else {
            let dirPath = path.join(basedir, 'uploads', username, 'preview');
            fs.readdir(dirPath, (err, files) => {
                if (err) throw err;
                files.forEach((filename) => {
                    fileRemovals.push(unlinkFileAsync(path.join(dirPath, filename)).then(err => {
                            if (err) console.log(username + ' failed to remove file: ' + filename + " with error: " + err.message);
                            console.log(username + ' removed file: ' + filename + " correctly.");
                        }
                    ));
                });

                Promise.all(fileRemovals)
                    .then(() => {
                        let dirPath = path.join(basedir, 'uploads', username, 'preview');
                        fs.readdir(dirPath, (err, files) => {
                            if (err) throw err;
                            socket.emit("Thumbnail.list", files, {
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