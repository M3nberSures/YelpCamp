const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

let userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: { type: String, default: '/imgs/noprofile.png'},
    description: { type: String, default: 'No description given...'},
    rank: { type: String, default: 'user'},
    date: { type: String, default: 'No birthday given'},
    phone: { type: String, default: 'No phone'},
    country: { type: String, default: 'No country given'},
    address: { type: String, default: 'No address given'},
    active: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next(new Error('email is already taken'));
      } else {
        next(error);
      }
});

userSchema.plugin(passportLocalMongoose, {
    usernameUnique: true,
    usernameLowerCase: true
});

module.exports = mongoose.model("User", userSchema);



