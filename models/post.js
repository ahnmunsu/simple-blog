var mongoose = require("mongoose");

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

module.exports = mongoose.model("Post", postSchema);
