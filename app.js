var express = require('express');
var partials = require('express-partials');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var redis = require('redis');
let redisStore = require('connect-redis')(session);
var util = require('./middleware/utilities');
var flash = require('connect-flash');
var config = require('./config');
var client  = redis.createClient();

var bodyParser = require('body-parser');

var routes = require('./routes');
var errorHandlers = require('./middleware/errorhandlers');
var log = require('./middleware/log');
var csrf = require('csurf');
var app = express();

app.set('view engine', 'ejs');
app.set('view options', {defaultLayout: 'layout'});
app.use(log.logger);
app.use(partials());

app.use(express.static(__dirname+'/static'));
app.use(cookieParser('secret'));
//app.use(session({secret:'secret'}));
app.use(session({
    secret: config.secret,
    saveUninitialized: true,
    resave: true,
    store: new redisStore({ host: config.redisHost, port: config.redisPort, client: client})
    })
);
app.use(flash());
app.use(util.templateRoutes);
//middleware stack right after session
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(csrf());
app.use(util.csrf);
app.use(util.authenticated);


// app.use(function(req, res, next){
//     if(req.session.pageCount)
//         req.session.pageCount++;
//     else
//         req.session.pageCount = 1;
//     next();
// });

app.get('/',routes.index);
app.get('/login',routes.login);
app.get('/accout/login',routes.login);
app.post('/loginProcess', routes.loginProcess);
app.get('/chat',[util.requireAuthentication], routes.chat);
app.get('/logout',routes.logOut);
    
app.get('/error', function(req, res, next){
    next(new Error('A contrived error'));
});

app.use(errorHandlers.notFound);
app.use(errorHandlers.error);

// app.get('*', function(req,res){
//     res.send('Express Response');
// });

app.listen(config.port, ()=>{
    console.log("App server running on port 3000");
});
