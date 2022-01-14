module.exports = function (passport, sessionManager) {
    let Session = require('../models/Session');
    var express = require('express');
    var router = express.Router();
    var Validator = require('validator');
    var Account = require('../models/Account');
    var Connection = require('../models/Connection');
    var fse = require('fs-extra');
    var AdmZip = require('adm-zip');
    var path = require('path')
    const uploads = path.join(__dirname, '../uploads');
    var baseAccountFolder = path.join(uploads, 'base_account');
    const filesPath = [path.join(uploads, 'DR.app'), path.join(uploads, 'PCP.app'), path.join(uploads, 'RegNet.app'), path.join(uploads, 'DMaps.app')]
    const baseAccountTemplate = path.join(uploads, 'account_template.db')
    const baseProperty = {
        "property": "propSelection", "icon": "fa fa-bullseye", "iconUnicode": "", "name": "Property selection",
        "structure": {"0": {"id": 0, "type": "0", "title": "propSelection", "children": [], "root": true, "desc": ""}},
        "translatedStructure": [{"path": [], "type": "0"}]
    }

    const meshProperty = {"property":"mesh","icon":"fa fa-cubes","iconUnicode":"","name":"mesh",
        "structure":{"0":{"id":0,"type":"0","title":"mesh","children":[],"root":true,"desc":""}},
        "translatedStructure":[{"path":[],"type":"0"}]}

    function isNotAuthenticated(req, res, next) {
        if (!req.user) {
            return next();
        }
        res.redirect('./auth');
    }

    router.get('/', function (req, res) {
        res.render('index', {showError: false});
    });

    router.get('/register', function (req, res) {
        res.render('register');
    });

    router.get('/recovery', function (req, res) {
        res.render('recovery');
    });

    router.post('/register', function (req, res) {
        Account.register(new Account({
            username: req.body.username,
            email: req.body.email
        }), req.body.password, function (err, account) {
            if (err) {
                return res.status(404).send("User already exits.");
            }
            let username = req.body.username;
            let dataDir = path.join(uploads, username);

            fse.mkdirSync(dataDir);
            let zip = new AdmZip(baseAccountTemplate);
            zip.extractAllTo(dataDir, true);

            let dbSaves = [];

            filesPath.forEach((filePath) => {
                sessionManager.importSessionBundle(username, filePath, () => {
                    dbSaves.push(
                        Session.find({username: username})
                            .select({title: 1, description: 1, lastModified: 1, id: 1, _id: 0})
                            .sort({lastModified: -1})
                    );
                });
            })

            dbSaves.push(Connection.findOneAndUpdate({
                username: username,
                property: baseProperty.property,
            }, baseProperty, {upsert: true, new: true, setDefaultsOnInsert: true}))

            dbSaves.push(Connection.findOneAndUpdate({
                username: username,
                property: meshProperty.property,
            }, meshProperty, {upsert: true, new: true, setDefaultsOnInsert: true}))


            Promise.all(dbSaves).then(() => {
                passport.authenticate('local')(req, res, function () {
                    res.redirect('./auth');
                });
            })

        });
    });

    router.post('/check_username', function (req, res) {

        if (typeof req.body.username !== "undefined" && Validator.isAlphanumeric(req.body.username) && req.body.username.length <= 12) {
            Account.find({username: req.body.username}, function (err, account) {
                if (err) {
                    res.json({error: true});
                }
                res.json({usernameFound: account.length > 0});
            });
        } else {
            res.json({error: true});
        }
    });


    router.post('/check_email', function (req, res) {

        if (typeof req.body.email !== "undefined" && Validator.isEmail(req.body.email)) {
            Account.find({email: req.body.email}, function (err, account) {
                if (err) {
                    res.json({error: true});
                }
                res.json({emailFound: account.length > 0});
            });
        } else {
            res.json({error: true});
        }
    });


    router.post('/login', function (req, res, next) {
        passport.authenticate('local', function (err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.render('index', {showError: true, message: "Log in failed, try again."});
            }
            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                return res.redirect('./auth');
            });
        })(req, res, next);
    });

    return router;
};
