var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function(err, user){
        done(err, user);
    });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){

    req.checkBody('email', 'Invalid Email').isEmail().notEmpty();
    req.checkBody('phoneNumber', 'Invalid phoneNumber').isMobilePhone("ar-SA");
    req.checkBody('password', 'Invalid Password').notEmpty().isLength({min:4});

    var errors = req.validationErrors();
    if(errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);   
        });
        return done(null, false, req.flash('error', messages));
    }


    User.findOne({'email': email}, function(err , user){
        if (err) return done(err);
        if (user) {
            return done(null, false, {message: 'Email is already in use'});
        } 
        var newUser = new User();
        newUser.name = req.body.name;
        newUser.email = email;
        newUser.phoneNumber = req.body.phoneNumber;
        newUser.password = newUser.encryptPassword(password);
        newUser.cart = req.session.cart ? req.session.cart: {};
        newUser.save(function(err, result){
            if (err) return done(err);
            req.flash('success' , 'you are now registered and can login');
            return done(null, newUser);
        });
    });
}));

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){

    req.checkBody('email', 'Invalid Email').isEmail().notEmpty();
    req.checkBody('password', 'Invalid Password').notEmpty();

    var errors = req.validationErrors();
    if(errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);   
        });
        return done(null, false, req.flash('error', messages));
    }

    
    User.findOne({'email': email}, function(err , user){
        if (err) return done(err);
        if (!user) {
            return done(null, false, {message: 'No user found!'});
        } 
        if(!user.validPassword(password)) {
            return done(null, false, {message:'Wrong password'})
        }
        if (user.cart == undefined) {
            User.update({'email':user.email}, {'cart': req.session.cart}, function(){
                if (err) res.send(err)
            });
        } else if (Object.keys(user.cart).length == 0 || user.cart.totalQty == 0){
            User.update({'email':user.email}, {'cart': req.session.cart}, function(){
                if (err) res.send(err)
            });
        }
        return done(null, user);
    });
}));