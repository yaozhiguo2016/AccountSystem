let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let session = require('express-session');
let sessionConfig = require('./config/session.json');
let multer = require('multer');

let index = require('./routes/index');
let login = require('./routes/login');
let register = require('./routes/register');
let user = require('./routes/user');
let message = require('./routes/message');

let apiOutput = require('./routes/api/v1/apiOutput');
let oauth2 = require('./routes/api/v1/oauth2');

let mysql = require('./lib/db/mysql/mysql-client');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.text());
app.use(bodyParser.json({strict:false}));// for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));// for parsing application/x-www-form-urlencoded
//app.use(multer()); // for parsing multipart/form-data
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    name:'account',//'connect.sid' by default
    secret:sessionConfig.secret,
    //key:config.dbName,
    cookie: {
                maxAge:sessionConfig.maxAge,
                secure:false,
                expires:new Date(Date.now() + sessionConfig.maxAge)
            },
    //store:new MongoStore({db:config.dbName})
    resave:false,
    saveUninitialized: true,
}));

//route handlers
app.use('/', index);
app.use('/user', user);
app.use('/login', login);
app.use('/register', register);
app.use('/message', message);
/**--------- oauth2 ---------**/
app.use(apiOutput); //api方法
app.use('/oauth2/v1', oauth2);//oauth route

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// init database mysql, connection pool would be created
mysql.init();

let server = app.listen(3000, ()=>{
    let host = server.address().address;
    let port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
});

/*  测试https协议
let fs = require('fs');
let https = require('https');

let server = https.createServer({
    key:fs.readFileSync('./keys/server.key'),
    cert:fs.readFileSync('./keys/server.crt')
}, app).listen(3000, ()=>{
    let host = server.address().address;
    let port = server.address().port;

    console.log('App listening at https://%s:%s', host, port);
});
*/

// Uncaught exception handler
process.on('uncaughtException', (err)=> {
    console.error(' Caught exception: ' + err.stack);
});

module.exports = app;
