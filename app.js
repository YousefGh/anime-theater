var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var Handlebars = require('handlebars');
var expressHbs = require('express-handlebars');
var session = require('express-session');
var MongoStore = require('connect-mongo') (session);
var passport = require('passport');
var flash = require('connect-flash');

/*----------- routes -----------*/
var index = require('./routes/index');
var users = require('./routes/user');
var cart = require('./routes/cart');

// mongodb://yousefGh:THEthe123@ds229008.mlab.com:29008/anime-theater
// MONGO connection
var mongoose = require('mongoose');

var uristring = 
  process.env.MONGODB_URI || 
  'mongodb://localhost:27017/anime-theater';




  mongoose.connect(uristring, function (err, res) {
    if (err) { 
      console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
      console.log ('Succeeded connected to: ' + uristring);
    }
  });


require('./config/passport'); 

var app = express();
// view engine setup
app.engine('.hbs', expressHbs({defaultLayout:'layout', extname:'.hbs'}))
app.set('view engine', '.hbs');

Handlebars.registerHelper('equal', function(lvalue, rvalue, options) {
  if (arguments.length < 3)
      throw new Error("Handlebars Helper equal needs 2 parameters");
  if( lvalue!=rvalue ) {
      return options.inverse(this);
  } else {
      return options.fn(this);
  }
});

Handlebars.registerHelper("and",function() {
  var args = Array.prototype.slice.call(arguments);
  var options = args[args.length-1];

  for(var i=0; i<args.length-1; i++){
      if( !args[i] ){
          return options.inverse(this);
      }
  }

  return options.fn(this);
});

Handlebars.registerHelper('notEqual', function(lvalue, rvalue, options) {
  if (arguments.length < 3)
      throw new Error("Handlebars Helper equal needs 2 parameters");
  if( lvalue==rvalue ) {
      return options.inverse(this);
  } else {
      return options.fn(this);
  }
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(session({
  secret:'secret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 180 * 60 * 1000 }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  res.locals.user = req.user
  res.locals.notLoggedIn = !req.isAuthenticated();
  next();
});

app.use(favicon(path.join(__dirname, 'public','img','favicon.ico'))); 

/*----------- routes usage -----------*/
app.use('/', index);
app.use('/', cart);
app.use('/', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
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

module.exports = app;