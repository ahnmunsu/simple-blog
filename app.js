var express = require("express");
var app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');

app.get("/", function(req, res) {
    var posts = [
        {   
            subject: "this is first post", 
            date:"2018-11-23 00:00:00", 
            author:"user1", 
            content:"In leo nisi, tempus sed elit sed, tempor posuere sapien. Aenean tincidunt venenatis nibh vel eleifend. Morbi luctus eros ut fermentum aliquam. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vivamus ut ante bibendum, consequat nisi sagittis, elementum odio. Donec maximus quis metus vel rhoncus. Sed lacus purus, ultricies ut blandit sit amet, iaculis imperdiet odio. Suspendisse dapibus eu est in consequat. Suspendisse potenti. Cras elementum porttitor fringilla. Aliquam a lacinia mauris. Curabitur eget velit vehicula, venenatis neque vel, dignissim elit. Maecenas et dictum dolor. Nunc lobortis mauris vel nulla tincidunt tincidunt. Fusce bibendum pulvinar tempor."
        },
        {   
            subject: "this is second post", 
            date:"2018-11-23 00:00:00", 
            author:"user1", 
            content:"Proin pharetra ut leo sed posuere. Fusce rutrum suscipit augue, quis varius magna accumsan ut. Suspendisse lacinia sem risus. Duis et nulla quis quam varius suscipit quis vitae neque. Nulla id semper lacus. Vestibulum ut aliquam ante. Aliquam ut maximus purus. Nulla facilisi. Donec dictum viverra neque, non tincidunt ex mattis sit amet. Ut interdum iaculis suscipit. Sed eu suscipit arcu. Mauris eget dolor ultricies, tincidunt leo sed, pulvinar orci."
        },
        {   
            subject: "this is third post", 
            date:"2018-11-23 00:00:00", 
            author:"user1", 
            content:"Aenean eu tortor sit amet erat vehicula bibendum nec vitae ex. Nunc tempus quam ut elementum elementum. Nulla hendrerit vitae felis a pharetra. In fringilla metus mi, eu fermentum eros porta luctus. Aenean bibendum ante eget mi mattis iaculis. Morbi a sapien tempus, ultrices libero quis, iaculis nunc. Fusce fringilla sit amet elit id efficitur. Donec commodo, eros nec auctor blandit, sapien libero rutrum eros, at vestibulum velit sapien eget mi. Suspendisse malesuada vel diam vel tincidunt."
        },
    ];
    
    res.render("home", {posts:posts});
})

app.listen(process.env.PORT, "0.0.0.0", function() {
    console.log("Simple Blog Server Has Started!");
})