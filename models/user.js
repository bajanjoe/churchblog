var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose"),

    UserSchema = new mongoose.Schema({
        username: String,
        password: String,
        nick: String
    })

UserSchema.plugin(passportLocalMongoose);


//Export data
module.exports = mongoose.model("User", UserSchema);