module.exports = function(passport) {

    var express = require('express');
    var router = express.Router();
    var Validator = require('validator');
    var Account = require('../models/Account');

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

            passport.authenticate('local')(req, res, function () {
                res.redirect('/');
            });
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
