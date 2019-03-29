var fs = require('fs');
var path = require('path');
var beautify = require('js-beautify').js_beautify;
var Component = require('../models/Component');
var CardManager = require('./CardManager');

class ProcessingCadManager extends CardManager {

    constructor(absoluteBasePath, relativeCodePath, relativeSchemaPath, relativeBaseFolder, usernameToken, type) {
        super(absoluteBasePath, relativeCodePath, relativeSchemaPath, relativeBaseFolder, usernameToken, type);
    }

    generateCard(schemaFileName, vizSchema, username, endCallback) {
        let self = this;
        let sourceCode = self.generateCode(vizSchema);
        let sourceCodeFilename = vizSchema.className + (vizSchema.runOn === 'javascript' ? ".js" : "");
        let sourceCodePath = path.join(this.absoluteBasePath, this.relativeCodePath.replace(this.usernameToken, username), sourceCodeFilename);

        fs.writeFile(sourceCodePath, sourceCode, function (err) {
            if (err) return console.log(err);

            console.log('#ProcessingCadManager - Visualization file saved: ' + sourceCodeFilename);

            let saveSchema = Object.assign({}, vizSchema);
            delete saveSchema.method;
            if (saveSchema.runOn === 'javascript')
                saveSchema.workerPath = "./auth/workers/js/" + vizSchema.id + ".js";
            let update = {
                properties: JSON.stringify(saveSchema),
                schemaFileName: schemaFileName,
                codeFileName: sourceCodeFilename,
                libs: vizSchema.selectedLibs,
                previewFileName: vizSchema.preview,
                runType: saveSchema.runOn
            };
            let options = {upsert: true, new: true, setDefaultsOnInsert: true};
            Component.findOneAndUpdate({
                username: username,
                id: vizSchema.id,
                type: self.type
            }, update, options, function (err) {
                if (err) return console.log("Error adding visualization " + vizSchema.id + " for " + username + " - error: " + err);

                console.log('#ProcessingCadManager - Visualization added to user collection: ' + vizSchema.id + ' for username: ' + username);
                delete vizSchema.method;
                endCallback("./auth/workers/js/" + sourceCodeFilename, vizSchema);
            });
        });

        return sourceCodeFilename;
    }

    generateCode(vizSchema) {
        var code;
        if (vizSchema.runOn === 'javascript') {
            let template = fs.readFileSync(path.join(this.absoluteBasePath, 'customComponents', 'templates', 'cardTemplate.js'), 'utf8');
            template = template.split("#code#").join(vizSchema.method.code);
            //TODO: remove beautify to reduce bandwidth usage
            code = beautify(template, {indent_size: 2});
        }
        else {
            code = vizSchema.method.code;
        }
        return code;
    }

}

module.exports = ProcessingCadManager;