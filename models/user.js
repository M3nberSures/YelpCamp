const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

let userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    image: { type: String, default: '/imgs/noprofile.png'},
    description: { type: String, default: 'No description given...'},
    rank: { type: String, default: 'user'},
    date: { type: String, default: 'No birthday given'},
    country: { type: String, default: 'No country given'},
    address: { type: String, default: 'No address given'},
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",userSchema);



