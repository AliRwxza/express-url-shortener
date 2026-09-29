var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require("express-session");

require('dotenv').config();

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var linkRouter = require('./routes/links');
var webAuthRouter = require('./routes/web/auth');
var webLinkRouter = require('./routes/web/links');
var userRouter = require('./routes/web/users');

var app = express();

app.use(express.static('css'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use('/', indexRouter);
app.use('/auth', webAuthRouter);
app.use('/links', webLinkRouter);
app.use('/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/links', linkRouter);

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
  res.render('error', {
    err: {
      status: err.status || 500,
      message: "error"
    }
  });
});

module.exports = app;
