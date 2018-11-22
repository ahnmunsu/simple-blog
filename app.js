var express = require("express");
var app = express();

app.get("/", function(req, res) {
    res.send("this will be the blog page soon!");
})

app.listen(process.env.PORT, "0.0.0.0", function() {
    console.log("Simple Blog Server Has Started!);
})