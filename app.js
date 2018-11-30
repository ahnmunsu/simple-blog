var express = require("express");
var app = express();
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");

var Post = require("./models/post");
var User = require("./models/user");
var Comment = require("./models/comment");

var middleware = require("./middleware");

var postRoutes = require("./routes/posts");
var commentRoutes = require("./routes/comments");
var indexRoutes = require("./routes/index");

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

app.use("/", indexRoutes);
app.use("/posts", postRoutes);
app.use("/posts/:id/comments", function(req, res, next) {
    req.postId = req.params.id;
    next();
} , commentRoutes);

app.set('view engine', 'ejs');

app.listen(process.env.PORT, "0.0.0.0", function() {
    console.log("Simple Blog Server Has Started!");
});
