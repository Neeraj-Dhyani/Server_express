const mongoose = require("mongoose");
const {Schema} = mongoose;

const couponSchema = new Schema({
    code:{type:String, required:true, uinque:true},
    discountType:{type:String, enum:["percentage", "fixed"], uinque:true},
    discountValue:{type:Number, required:true},
    minOrderAmount:{type:Number, default:0},
    maxDiscount:{type:Number, default:null},
    expiryDate:{type:Date, require:true},
    maxUsage:{type: Number, default:null},
    useCount:{type:Number, default:0},
    active:{type:Boolean, default:true}
})

module.exports = mongoose.model("coupon", couponSchema)