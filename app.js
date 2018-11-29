var express = require("express");
var app = express();
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");

var postSchema = new mongoose.Schema({
    subject: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    content: String,
    date: Date,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

var Post = mongoose.model("Post", postSchema);

var userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User", userSchema);

var commentSchema = new mongoose.Schema({
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});

var Comment = mongoose.model("Comment", commentSchema);

mongoose.connect("mongodb://localhost/simple_blog", { useNewUrlParser: true});

app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
    secret: "$2R^9j&0b*4p^4N",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set('view engine', 'ejs');

app.get("/", function(req, res) {
    Post.find({}, function(err, allPosts) {
        if (err) {
            console.log(err);
        } else {
            res.render("posts", {posts:allPosts, currentUser:req.user});
        }
    })
});

app.get("/posts/new", isLoggedIn, function(req, res) {
    res.render("new", {currentUser:req.user});
});

app.get("/posts/:id", function(req, res) {
    Post.findById(req.params.id).populate("comments").exec(function(err, foundPost) {
        if (err) {
            console.log(err);
        } else {
            if (foundPost) {
                res.render("show", {post:foundPost, currentUser:req.user});
            } else {
                res.redirect("/");
            }
        }
    });
});

app.get("/posts/:id/edit", checkPostOwnerShip, function(req, res) {
    Post.findById(req.params.id, function(err, foundPost) {
        if (err) {
            console.log(err);
        } else {
            if (foundPost) {
                res.render("edit", {post:foundPost, currentUser:req.user});
            } else {
                res.redirect("/");
            }
        }
    });
});

app.get("/about", function(req, res) {
    res.render("about", {currentUser:req.user});
});

app.post("/posts", function(req, res) {
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
            res.redirect("/");
        }
    });
});

app.put("/posts/:id", checkPostOwnerShip, function(req, res) {
    req.body.post.date = Date();
    Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, updatedPost) {
        if (err) {
            res.redirect("/");
        } else {
            res.redirect("/posts/" + req.params.id);
        }
    });
});

app.delete("/posts/:id", checkPostOwnerShip, function(req, res) {
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
            res.redirect("/");
        } else {
            res.redirect("/");
        }
    });
});

app.get("/register", isNotLoggedIn, function(req, res) {
    res.render("register", {currentUser:req.user});
});

app.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render("register", {currentUser:req.user});
        }
        
        passport.authenticate("local")(req, res, function() {
            res.redirect("/");
        });
    });
});

app.get("/login", isNotLoggedIn, function(req, res) {
    res.render("login", {currentUser:req.user});
});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

app.post("/login", 
    passport.authenticate(
            "local", 
            {
                successRedirect: "/",
                failureRedirect: "/login"
            }), function(req, res) {
});

app.get("/deregister", function(req, res) {
    res.render("deregister", {currentUser:req.user});
});

app.delete("/deregister", function(req, res) {
    User.findByIdAndRemove(req.user._id, function(err) {
        if (err) {
            res.redirect("/");
        } else {
            req.logout();
            res.redirect("/");
        }
    });
});

app.post("/posts/:id/comment", isLoggedIn, function(req, res) {
    Post.findById(req.params.id, function(err, foundPost) {
        if (err) {
            console.log(err);
            res.redirect("/");
        } else {
            if (foundPost) {
                Comment.create(req.body.comment, function(err, comment) {
                    if (err) {
                        console.log(err);
                        res.redirect("/");
                    } else {
                        comment.author.id = req.user._id;
                        comment.author.username = req.user.username;
                        comment.save();
                        foundPost.comments.unshift(comment);
                        foundPost.save();
                        res.redirect("/posts/" + foundPost._id);
                    }
                });
            } else {
                res.redirect("/");
            }
        }
    })
});

app.get("/posts/:id/comment/:comment_id/edit", checkCommentOwnerShip, function(req, res) {
    Post.findById(req.params.id).populate("comments").exec(function(err, foundPost) {
        if (err) {
            console.log(err);
        } else {
            if (foundPost) {
                Comment.findById(req.params.comment_id, function(err, foundComment) {
                    if (err) {
                        console.log(err);
                    } else { 
                        if (foundComment) {
                            res.render("comment_edit", {post:foundPost, currentUser:req.user, comment_to_edit:foundComment});
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

app.put("/posts/:id/comment/:comment_id", checkCommentOwnerShip, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if (err) {
            res.redirect("/");
        } else {
            res.redirect("/posts/" + req.params.id);
        }
    });
});

app.delete("/posts/:id/comment/:comment_id", checkCommentOwnerShip, function(req, res) {
    Post.findById(req.params.id, function(err, foundPost) {
        if (err) {
            console.log(err);
            res.redirect("/");
        } else {
            var idx = foundPost.comments.indexOf(req.params.comment_id);
            if (idx !== -1) {
                foundPost.comments.splice(idx, 1);
                foundPost.save();
                
                Comment.findByIdAndRemove(req.params.comment_id, function(err) {
                    if (err) {
                        console.log(err);
                    }
                    res.redirect("/posts/" + req.params.id);
                });
            }
        }
    });
})

function isLoggedIn(req, res, next) {
    if (req. isAuthenticated()) {
        return next();
    }
    
    res.redirect("/login");
}

function isNotLoggedIn(req, res, next) {
    if (!req. isAuthenticated()) {
        return next(); 
    }
   
    res.redirect("/");
}

function checkPostOwnerShip(req, res, next) {
    if (req.isAuthenticated()) {
        Post.findById(req.params.id, function(err, foundPost) {
            if (err) {
                res.redirect("back");
            } else {
                if (foundPost.author.id.equals(req.user._id)) {
                    next();
                } else {
                    res.redirect("back");
                }
            }
        })
    } else {
        res.redirect("back");
    }
}

function checkCommentOwnerShip(req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if (err) {
                res.redirect("back");
            } else {
                if (foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    res.redirect("back");
                }
            }
        })
    } else {
        res.redirect("back");
    }
}

app.listen(process.env.PORT, "0.0.0.0", function() {
    console.log("Simple Blog Server Has Started!");
});
