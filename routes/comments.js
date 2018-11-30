var express = require("express");
var router  = express.Router();
var Post = require("../models/post");
var Comment = require("../models/comment");
var middleware = require("../middleware");

router.post("/", middleware.isLoggedIn, function(req, res) {
    var postId = req.postId;
    
    Post.findById(postId, function(err, foundPost) {
        if (err) {
            console.log(err);
            res.redirect("/posts");
        } else {
            if (foundPost) {
                Comment.create(req.body.comment, function(err, comment) {
                    if (err) {
                        req.flash("error", "Cannot add comment");
                        res.redirect("/posts");
                    } else {
                        comment.author.id = req.user._id;
                        comment.author.username = req.user.username;
                        comment.save();
                        foundPost.comments.unshift(comment);
                        foundPost.save();
                        req.flash("success", "Comment added successfully");
                        res.redirect("/posts/" + foundPost._id);
                    }
                });
            } else {
                res.redirect("/posts");
            }
        }
    });
});

router.get("/:comment_id/edit", middleware.checkCommentOwnerShip, function(req, res) {
    var postId = req.postId;
    
    Post.findById(postId).populate("comments").exec(function(err, foundPost) {
        if (err) {
            console.log(err);
        } else {
            if (foundPost) {
                Comment.findById(req.params.comment_id, function(err, foundComment) {
                    if (err) {
                        console.log(err);
                    } else { 
                        if (foundComment) {
                            res.render("comments/edit", {post:foundPost, currentUser:req.user, comment_to_edit:foundComment});
                        } else {
                            console.log(err);
                        }
                    }
                });
            } else {
                res.redirect("/");
            }
        }
    });
});

router.put("/:comment_id", middleware.checkCommentOwnerShip, function(req, res) {
    var postId = req.postId;
    
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if (err) {
            res.redirect("/posts");
        } else {
            req.flash("success", "Comment updated successfully");
            res.redirect("/posts/" + postId);
        }
    });
});

router.delete("/:comment_id", middleware.checkCommentOwnerShip, function(req, res) {
    var postId = req.postId;
    
    Post.findById(postId, function(err, foundPost) {
        if (err) {
            console.log(err);
            res.redirect("/posts");
        } else {
            var idx = foundPost.comments.indexOf(req.params.comment_id);
            if (idx !== -1) {
                foundPost.comments.splice(idx, 1);
                foundPost.save();
                
                Comment.findByIdAndRemove(req.params.comment_id, function(err) {
                    if (err) {
                        console.log(err);
                    }
                    req.flash("success", "Comment deleted successfully");
                    res.redirect("/posts/" + postId);
                });
            }
        }
    });
});

module.exports = router;