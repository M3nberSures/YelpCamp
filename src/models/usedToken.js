const mongoose = require("mongoose");

let usedTokenSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    createdAt   : {type: Date, default: Date.now, expires: 3600}
});


module.exports = mongoose.model("UsedToken", usedTokenSchema);



