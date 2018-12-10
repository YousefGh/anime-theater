var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var csrfProtection = csrf();
var passport = require('passport');
router.use(csrfProtection);
var nodemailer = require('nodemailer');
var Order = require('../models/order');
var Cart = require('../models/cart');
var Product = require('../models/product');
var User = require('../models/user');

/* GET home page. */
router.get('/', function (req, res, next) {
  var successMsg = req.flash('success')[0];
  res.render('entity/index', {
    title: 'HOME',
    successMsg: successMsg,
    noMessages: !successMsg
  });
});

// SHOP
router.get('/shop', function (req, res, next) {
  Product
    .find(function (err, docs) {
      var productChunks = [];
      var chunkSize = 4;
      for (var i = 0; i < docs.length; i += chunkSize) {
        productChunks.push(docs.slice(i, i + chunkSize));
      }
      res.render('entity/shop', {
        title: 'SHOP',
        productsArr: productChunks
      });
    });
});

module.exports = router;
