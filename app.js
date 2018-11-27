var express = require("express");
var app = express();
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost/simple_blog", { useNewUrlParser: true});

var postSchema = new mongoose.Schema({
    subject: String,
    author: String,
    content: String,
    date: Date
});

var Post = mongoose.model("Post", postSchema);

app.get("/", function(req, res) {
    Post.find({}, function(err, allPosts) {
        if (err) {
            console.log(err);
        } else {
            res.render("posts", {posts:allPosts});
        }
    })
});

app.get("/posts/new", function(req, res) {
    res.render("new");
});

app.get("/posts/:id", function(req, res) {
    Post.findById(req.params.id, function(err, foundPost) {
        if (err) {
            console.log(err);
        } else {
            res.render("show", {post:foundPost});
        }
    });
});

app.get("/posts/:id/edit", function(req, res) {
    Post.findById(req.params.id, function(err, foundPost) {
        if (err) {
            console.log(err);
        } else {
            res.render("edit", {post:foundPost});
        }
    });
});

app.get("/about", function(req, res) {
    res.render("about");
});

app.post("/posts", function(req, res) {
    var newPost = { 
        subject: req.body.post.subject, 
        date: Date(),
        author: "user1", 
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

app.listen(process.env.PORT, "0.0.0.0", function() {
    console.log("Simple Blog Server Has Started!");
});
