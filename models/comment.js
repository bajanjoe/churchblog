mongoose = require("mongoose")


commentSchema = mongoose.Schema({
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }

});


//Export data
module.exports = mongoose.model("Comment", commentSchema);