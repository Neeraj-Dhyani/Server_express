const mongoose = require("mongoose");
const {Schema} = mongoose

const bannerSchema = new Schema({
    title:{type:String},
    subtitle:{type:String},
    offer:{type:String},
    coupon:{type:String},
    image:{type:String},
    startingDate:{type:String},
    endDate:{type:String},
    createdAt:{type:Date, default:Date.now}
})

module.exports = mongoose.model("banner", bannerSchema)