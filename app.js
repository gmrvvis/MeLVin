var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var app = express();
var fs = require('fs');
var serverConfig = JSON.parse(fs.readFileSync('config.json'));
// var options = {
//     key: fs.readFileSync(serverConfig.certKeyPath),
//     cert: fs.readFileSync(serverConfig.certPath)
// };
// var server = require('https').createServer(options, app);
var server = require('http').createServer(app);
var MongoStore = require('connect-mongo')(session);
var LocalStrategy = require('passport-local').Strategy;
var Account = require('./models/Account');
var multer = require('multer');
var passportSocketIo = require("passport.socketio");
var passport = require('passport');

var socketList = {};
var VisualizationManager = require('./customComponents/VisualizationCardManager');
var CardManager = require('./customComponents/ProcessingCardManager');
var ConnectionManager = require('./customComponents/ConnectionManager');
var SessionManager = require('./customComponents/AppManager');

var sessionStore = new MongoStore({
    host: serverConfig.mongoDB.host,
    port: serverConfig.mongoDB.port,
    db: serverConfig.mongoDB.db,
    url: serverConfig.mongoDB.url
});

let sessionEventHandler = require('./handlers/session');
let fileEventHandler = require('./handlers/file');
let visualizationEventHandler = require('./handlers/visualization');
let processingEventHandler = require('./handlers/processing');
let dependencyEventHandler = require('./handlers/dependencie');
let backendWorkEventHandler = require('./handlers/backendWork');
let connectionEventHandler = require('./handlers/connection');

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        switch (req.route.path) {
            case  '/uploadData':
                cb(null, './uploads/' + req.user.username + "/data");
                break;
            case  '/uploadViz':
                cb(null, './uploads/' + req.user.username + "/customCards/visualizations/schemas");
                break;
            case  '/uploadWorker':
                cb(null, './uploads/' + req.user.username + "/customCards/functional/schemas");
                break;
            case  '/uploadLib':
                cb(null, './uploads/' + req.user.username + "/lib");
                break;
            case  '/uploadPreview':
                cb(null, './uploads/' + req.user.username + "/preview");
                break;
            case  '/uploadSession':
                cb(null, './uploads/' + req.user.username);
                break;
            case  '/uploadConnection':
                cb(null, './uploads/' + req.user.username + "/temp");
                break;
        }
    },
    filename: function (req, file, cb) {
        //TODO: security checks
        cb(null, file.originalname);
    }
});

app.disable('x-powered-by');
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.set('trust proxy', 'loopback');
app.use(logger('common'));
app.use(bodyParser.urlencoded({extended: true, limit: '100mb'}));
app.use(bodyParser.json({extended: true, limit: '100mb'}));
app.use(cookieParser());
app.use(require('express-session')({
    secret: serverConfig.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    key: 'connect.sid'
}));
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs');
app.set('views', [path.join(__dirname, '/public/views'), path.join(__dirname, '/auth')]);

passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());


let usernameToken = '#username#';
let relativeCodePath = 'uploads/' + usernameToken + '/customCards/visualizations/js';
let relativeSchemaPath = 'uploads/' + usernameToken + '/customCards/visualizations/schemas';
let relativeBasePath = 'uploads/' + usernameToken + '/customCards/visualizations/';
let type = 'v';
let customVizManager = new VisualizationManager(__dirname, relativeCodePath, relativeSchemaPath, relativeBasePath, usernameToken, type);

let relativeProcCodePath = 'uploads/' + usernameToken + '/customCards/functional/js';
let relativeProcSchemaPath = 'uploads/' + usernameToken + '/customCards/functional/schemas';
let relativeProcBasePath = 'uploads/' + usernameToken + '/customCards/functional/';
type = 'p';

let customCardManager = new CardManager(__dirname, relativeProcCodePath, relativeProcSchemaPath, relativeProcBasePath, usernameToken, type);

let connectionManager = new ConnectionManager(__dirname, relativeProcCodePath, relativeProcSchemaPath, relativeProcBasePath, usernameToken, type);

let sessionManager = new SessionManager(__dirname, relativeCodePath, relativeSchemaPath, relativeBasePath, relativeProcCodePath, relativeProcSchemaPath, relativeProcBasePath, usernameToken);

function isAuthenticated(req, res, next) {
    if (req.user) {
        return next();
    }
    res.redirect('./');
}

function isNotAuthenticated(req, res, next) {
    if (!req.user) {
        return next();
    }
    res.redirect('./auth');
}

let publicSite = require('./routes/public')(passport, sessionManager);
let authenticatedSite = require('./routes/authenticated')(__dirname, storage, socketList, customVizManager, customCardManager, sessionManager);

app.use("/auth", isAuthenticated, authenticatedSite);
app.use("/auth", isAuthenticated, express.static(path.join(__dirname, 'auth')));

app.use('/', isNotAuthenticated, publicSite);
app.use("/", isNotAuthenticated, express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost/melvin_users', {useMongoClient: true});

var serverApp = server.listen(serverConfig.port, '0.0.0.0', function () {
    console.log('Listening at %s', serverApp.address().port);
});


var io = require('socket.io')(server, {path: '/auth/wSocket'});
io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: 'connect.sid',
    secret: serverConfig.sessionSecret,
    store: sessionStore,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail,
}));

function onAuthorizeSuccess(data, accept) {
    accept(null, true);
}

function onAuthorizeFail(data, message, error, accept) {
    if (error)
        throw new Error(message);
    accept(null, false);
    if (error)
        accept(new Error(message));
}


io.on('connection', function (socket) {
    let username = socket.client.request.user.username;
    console.log('Client connected: ' + username);
    socketList[username] = socket;
    socket.emit('Account.username', username);
    backendWorkEventHandler(__dirname, socket);
    sessionEventHandler(__dirname, sessionManager, socket);
    fileEventHandler(__dirname, socket);
    visualizationEventHandler(__dirname, customVizManager, socket);
    processingEventHandler(__dirname, customCardManager, socket);
    connectionEventHandler(__dirname, connectionManager, socket);
    dependencyEventHandler(__dirname, socket);
});

app.use(function (req, res, next) {
    res.status(404).send("404 Not found.");
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('500 Internal server error.');
});

module.exports = app;