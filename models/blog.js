mongoose = require("mongoose")

var Schema = mongoose.Schema;

//Mongoose model config
var blogSchema = new Schema({
    title: String,
    image: String,
    body: String,
    created: { type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },  
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]

});

//Export data
module.exports = mongoose.model('Blog', blogSchema);




