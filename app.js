var express = require("express");
var app = express();
var methodOverride = require("method-override");
var bodyParser = require("body-parser");

var posts = [
    {   
        id: 0,
        subject: "this is first post", 
        date:"2018-11-23 00:00:00", 
        author:"user1", 
        content:"In leo nisi, tempus sed elit sed, tempor posuere sapien. Aenean tincidunt venenatis nibh vel eleifend. Morbi luctus eros ut fermentum aliquam. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus ut ante bibendum, consequat nisi sagittis, elementum odio. Donec maximus quis metus vel rhoncus. Sed lacus purus, ultricies ut blandit sit amet, iaculis imperdiet odio. Suspendisse dapibus eu est in consequat. Suspendisse potenti. Cras elementum porttitor fringilla. Aliquam a lacinia mauris. Curabitur eget velit vehicula, venenatis neque vel, dignissim elit. Maecenas et dictum dolor. Nunc lobortis mauris vel nulla tincidunt tincidunt. Fusce bibendum pulvinar tempor."
    },
    {   
        id: 1,
        subject: "this is second post", 
        date:"2018-11-23 00:00:00", 
        author:"user1", 
        content:"Proin pharetra ut leo sed posuere. Fusce rutrum suscipit augue, quis varius magna accumsan ut. Suspendisse lacinia sem risus. Duis et nulla quis quam varius suscipit quis vitae neque. Nulla id semper lacus. Vestibulum ut aliquam ante. Aliquam ut maximus purus. Nulla facilisi. Donec dictum viverra neque, non tincidunt ex mattis sit amet. Ut interdum iaculis suscipit. Sed eu suscipit arcu. Mauris eget dolor ultricies, tincidunt leo sed, pulvinar orci."
    },
    {   
        id: 2,
        subject: "this is third post", 
        date:"2018-11-23 00:00:00", 
        author:"user1", 
        content:"Aenean eu tortor sit amet erat vehicula bibendum nec vitae ex. Nunc tempus quam ut elementum elementum. Nulla hendrerit vitae felis a pharetra. In fringilla metus mi, eu fermentum eros porta luctus. Aenean bibendum ante eget mi mattis iaculis. Morbi a sapien tempus, ultrices libero quis, iaculis nunc. Fusce fringilla sit amet elit id efficitur. Donec commodo, eros nec auctor blandit, sapien libero rutrum eros, at vestibulum velit sapien eget mi. Suspendisse malesuada vel diam vel tincidunt."
    },
];

app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

app.get("/", function(req, res) {
    res.render("posts", {posts:posts});
})

app.get("/posts/new", function(req, res) {
    res.render("new");
})

app.get("/posts/:id", function(req, res) {
    posts.forEach(function(element) {
        if (element.id == req.params.id) {
            res.render("show", {post:element});
            return; 
        }
    });
})

app.get("/posts/:id/edit", function(req, res) {
    posts.forEach(function(element) {
        if (element.id == req.params.id) {
            res.render("edit", {post:element});
            return;
        }
    });
})

app.get("/about", function(req, res) {
    res.render("about");
})

function pad(n, width) {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

app.post("/posts", function(req, res) {
    var today = new Date();
    var date = pad(today.getFullYear(), 4) + '-' + pad(today.getMonth()+1, 2) + '-' + pad(today.getDate(), 2);
    var time = pad(today.getHours(), 2) + ":" + pad(today.getMinutes(), 2) + ":" + pad(today.getSeconds(), 2);
    var dateTime = date+' '+ time;
    
    var post = { 
        id: posts.length+1, 
        subject: req.body.post.subject, 
        date: dateTime,
        author: "user1", 
        content: req.body.post.content
    };
   
    posts.push(post); 
    res.redirect("/");
})

app.put("/posts/:id", function(req, res) {
    posts.forEach(function(element) {
        if (element.id == req.params.id) {
            element.subject = req.body.post.subject; 
            element.content = req.body.post.content; 
            res.redirect("/posts/" + req.params.id);
            return;
        }
    });
})

app.delete("/posts/:id", function(req, res) {
   for (var idx=0; idx<posts.length; idx++) {
       if (req.params.id == posts[idx].id) {
           posts.splice(idx, 1);
           res.redirect("/");
           return;
       }
   }
})

app.listen(process.env.PORT, "0.0.0.0", function() {
    console.log("Simple Blog Server Has Started!");
})