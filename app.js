var express = require("express");
var app = express();

app.use( express.static( "public" ) );
app.set('view engine', 'ejs');

app.get("/", function(req, res) {
    res.render("home");
})

app.listen(process.env.PORT, "0.0.0.0", function() {
    console.log("Simple Blog Server Has Started!");
})