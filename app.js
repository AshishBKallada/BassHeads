 var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');

const http = require('http');

const express = require('express');
const session = require('express-session');
const app = express();

require('dotenv').config();


app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 3600000,
  },
}));
global.signupData = {};


app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => {
  if (req.files && req.files.variants) {
    req.body.variants = req.files.variants.map((variant, index) => ({
      color: req.body[`variants[${index}][color]`],
      stock: req.body[`variants[${index}][stock]`],
      images: variant.map(file => ({
        filename: file.filename,
      })),
    }));
  }
  next();
});


const { log } = require('console');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');




app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRouter);
app.use('/', usersRouter);





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
