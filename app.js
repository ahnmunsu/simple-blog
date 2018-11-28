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
    author: String,
    content: String,
    date: Date
});

var Post = mongoose.model("Post", postSchema);

var userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User", userSchema);

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
    Post.findById(req.params.id, function(err, foundPost) {
        if (err) {
            console.log(err);
        } else {
            res.render("show", {post:foundPost, currentUser:req.user});
        }
    });
});

app.get("/posts/:id/edit", function(req, res) {
    Post.findById(req.params.id, function(err, foundPost) {
        if (err) {
            console.log(err);
        } else {
            res.render("edit", {post:foundPost, currentUser:req.user});
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
        author: req.user.username, 
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

app.put("/posts/:id", function(req, res) {
    req.body.post.date = Date();
    Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, updatedPost) {
        if (err) {
            res.redirect("/");
        } else {
            res.redirect("/posts/" + req.params.id);
        }
    });
});

app.delete("/posts/:id", function(req, res) {
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

app.listen(process.env.PORT, "0.0.0.0", function() {
    console.log("Simple Blog Server Has Started!");
});
