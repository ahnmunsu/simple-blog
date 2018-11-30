var express = require("express");
var router  = express.Router();
var Post = require("../models/post");
var middleware = require("../middleware");
var Comment = require("../models/comment");

router.get("/", function(req, res) {
    Post.find({}, function(err, allPosts) {
        if (err) {
            console.log(err);
        } else {
            res.render("posts/index", {posts:allPosts, currentUser:req.user});
        }
    })
});

router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("posts/new", {currentUser:req.user});
});

router.get("/:id", function(req, res) {
    Post.findById(req.params.id).populate("comments").exec(function(err, foundPost) {
        if (err) {
            console.log(err);
        } else {
            if (foundPost) {
                res.render("posts/show", {post:foundPost, currentUser:req.user});
            } else {
                res.redirect("/posts");
            }
        }
    });
});

router.get("/:id/edit", middleware.checkPostOwnerShip, function(req, res) {
    Post.findById(req.params.id, function(err, foundPost) {
        if (err) {
            console.log(err);
        } else {
            if (foundPost) {
                res.render("posts/edit", {post:foundPost, currentUser:req.user});
            } else {
                res.redirect("/posts");
            }
        }
    });
});

router.post("/", function(req, res) {
    var newPost = { 
        subject: req.body.post.subject, 
        date: Date(),
        author: {
            id: req.user._id, 
            username: req.user.username
        },
        content: req.body.post.content
    };
   
    Post.create(newPost, function(err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/posts");
        }
    });
});

router.put("/:id", middleware.checkPostOwnerShip, function(req, res) {
    req.body.post.date = Date();
    Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, updatedPost) {
        if (err) {
            res.redirect("/posts");
        } else {
            res.redirect("/posts/" + req.params.id);
        }
    });
});

router.delete("/:id", middleware.checkPostOwnerShip, function(req, res) {
    Post.findById(req.params.id, function(err, foundPost) {
        foundPost.comments.forEach(function(comment) {
            Comment.findByIdAndRemove(comment._id, function(err) {
                if (err) {
                    console.log(err);
                }
            });
        });
    });
    
    Post.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/posts");
        }
    });
});

module.exports = router;
