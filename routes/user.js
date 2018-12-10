var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var csrfProtection = csrf();
var passport = require('passport');
router.use(csrfProtection);
var Order = require('../models/order');
var Cart = require('../models/cart');
var User = require('../models/user');

var middleware = require('../middleware/index');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('user/signup');
});

router.get('/profile', middleware.isLoggedIn, function (req, res, next) {
  Order.find({
      user: req.user
    }, function (err, orders) {
      if (err) {
        return res.write('Error!');
      }
      var cart;
      orders.forEach(function (order) {
        cart = new Cart(order.cart);
        order.items = cart.generateArray();
      });
      res.render('user/profile', {orders: orders, title: 'ACCOUNT'});
    });
});

router.get('/logout', middleware.isLoggedIn, function (req, res, next) {
  req.logOut();
  res.redirect('/');
});

router.use('/', middleware.notLoggedIn, function (req, res, next) {
  next();
});

router.get('/login', function (req, res, next) {
  var messages = req.flash('error');
  res.render('user/login', {
    title: 'LOGIN',
    csrfToken: req.csrfToken(),
    messages: messages,
    hasErrors: messages.length > 0
  });
});

router.post('/login', passport.authenticate('local.signin', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}), function (req, res, next) {

  if (req.session.oldUrl) {
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else {
    res.redirect('/user/profile');
  }

});

router.get('/signup', function (req, res, next) {
  var messages = req.flash('error');
  res.render('user/signup', {
    title: 'SIGNUP',
    csrfToken: req.csrfToken(),
    messages: messages,
    hasErrors: messages.length > 0
  });
});

router.post('/signup', passport.authenticate('local.signup', {
  successRedirect: '/',
  failureRedirect: '/signup',
  failureFlash: true
}), function (req, res, next) {

  if (req.session.oldUrl) {
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  } else {
    res.redirect('/user/profile');
  }

});

module.exports = router;
