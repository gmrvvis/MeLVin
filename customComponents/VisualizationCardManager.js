var fs = require('fs');
var path = require('path');
var beautify = require('js-beautify').js_beautify;
var Component = require('../models/Component');
var CardManager = require('./CardManager');

class VisualizationCardManager extends CardManager {

    constructor(absoluteBasePath, relativeCodePath, relativeSchemaPath, relativeBaseFolder, usernameToken, type) {
        super(absoluteBasePath, relativeCodePath, relativeSchemaPath, relativeBaseFolder, usernameToken, type);
    }

    generateCard(schemaFileName, vizSchema, username, endCallback) {
        let self = this;
        let sourceCode = self.generateCode(vizSchema);
        let sourceCodeFilename = vizSchema.className + ".js";
        let sourceCodePath = path.join(this.absoluteBasePath, this.relativeCodePath.replace(this.usernameToken, username), sourceCodeFilename);

        fs.writeFile(sourceCodePath, sourceCode, function (err) {
            if (err) {
                return console.log(err);
            }

            console.log('#VisualizationCardManager - Visualization file saved: ' + sourceCodeFilename);

            let saveSchema = Object.assign({}, vizSchema);
            delete saveSchema.methods;
            let update = {properties: JSON.stringify(saveSchema), schemaFileName: schemaFileName,
                codeFileName: vizSchema.className + ".js", libs: vizSchema.selectedLibs, previewFileName: vizSchema.preview};
            let options = {upsert: true, new: true, setDefaultsOnInsert: true};
            Component.findOneAndUpdate({
                username: username,
                id: vizSchema.id,
                type: self.type,
            }, update, options, function (err, schema) {
                if (err) return console.log("Error adding visualization " + vizSchema.id + " for " + username + " - error: " + err);

                console.log('#VisualizationCardManager - Visualization added to user collection: ' + vizSchema.id + ' for username: ' + username);
                delete vizSchema.methods;
                endCallback("./auth/visualizations/js/" + sourceCodeFilename, vizSchema);

            });
        });

    }

    generateCode(vizSchema) {

        let template = fs.readFileSync(path.join(this.absoluteBasePath, 'customComponents', 'templates', 'visualizationTemplate.js'), 'utf8');
        template = template.split("#name#").join(vizSchema.className);

        let methods = [];
        Object.keys(vizSchema.methods).forEach(function (methodName) {
            let method = methodName + "(#arg#) {";
            let argNames = vizSchema.methods[methodName].args;
            method = method.replace("#arg#", argNames);
            method = method + "\n" + vizSchema.methods[methodName].code + "\n }";
            methods.push(method);
        });

        template = template.split("#methods#").join(methods.join('\n\n'));
        template = beautify(template, {indent_size: 2});

        return template;
    }

}

module.exports = VisualizationCardManager;