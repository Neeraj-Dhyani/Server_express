const mongoose = require("mongoose");
const {Schema} = mongoose

const admin_schema = new Schema({
    name:{type:String},
    email:{type:String},
    password:{type:String}
})

module.exports = mongoose.model("admin", admin_schema)