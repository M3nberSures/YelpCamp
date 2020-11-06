const mongoose = require("mongoose"); 

let campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    comments: [
            {
               type: mongoose.Schema.Types.ObjectId,
               ref: "Comment"
            }
         ],
    author: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    },
    price: Number,
    street: String,
    city: String,
    state: String,
    country: String
  }, { timestamps: true });
  
module.exports = mongoose.model("Campground", campgroundSchema);


