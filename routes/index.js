var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");



router.get("/", function (req, res) {

    res.render('pages/home');

});

//Secret page, access if user is loggen in "isLoggedIn"
router.get("/secret", isLoggedIn, function (req, res) {
    res.render('pages/secret');
});


//Auth routes
//Section 35 lecture 342

//Show sign up form
router.get("/register", function (req, res) {
    res.render('pages/register');
});

//Handle user registration
router.post("/register", function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    User.register(new User({ username: username}), password, function (err, user) {
        if (err) {
            console.log(err)
            return res.render('pages/register')
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/secret")
        });
    });

})


//Login route
//render login
router.get("/login", function (req, res) {

    res.render('pages/login');

});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/blog",
    failureRedirect: "/login"
}), function (req, res) {


})


router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/")
})


//funtion to verify if user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login")
}

module.exports = router;
