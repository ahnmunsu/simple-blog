var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var middleware = require("../middleware");

router.get("/about", function(req, res) {
    res.render("about", {currentUser:req.user});
});

router.get("/register", middleware.isNotLoggedIn, function(req, res) {
    res.render("register", {currentUser:req.user});
});

router.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render("register", {currentUser:req.user});
        }
        
        passport.authenticate("local")(req, res, function() {
            res.redirect("/posts");
        });
    });
});

router.get("/login", middleware.isNotLoggedIn, function(req, res) {
    res.render("login", {currentUser:req.user});
});

router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/posts");
});

router.post("/login", 
    passport.authenticate(
            "local", 
            {
                successRedirect: "/posts",
                failureRedirect: "/login"
            }), function(req, res) {
});

router.get("/deregister", function(req, res) {
    res.render("deregister", {currentUser:req.user});
});

router.delete("/deregister", function(req, res) {
    User.findByIdAndRemove(req.user._id, function(err) {
        if (err) {
            res.redirect("/posts");
        } else {
            req.logout();
            res.redirect("/posts");
        }
    });
});

module.exports = router;
