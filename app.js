var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongodb=require('mongodb');
var session = require('express-session')
var fileStore = require('session-file-store')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(session({
  secret: 'session_login',
  resave: false,
  saveUninitialized: true,
  store: new fileStore()
}));

//몽고db 연결을 위한 함수
function connectDB(){
  //27017 는 몽고db의 기본 주소이다.
  var databaseUrl = "mongodb://localhost:27017/testdb";
  
  //db연결
  mongodb.connect(databaseUrl, function(err, database){
    if(err) throw err;
    console.log("DB 연결 완료! : " + databaseUrl);
    app.set('database',database.db("testdb"));
  });
}
connectDB();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

module.exports = app;
