const mongoose = require("mongoose");

let categorySchema = new mongoose.Schema({
    name:{type:String, required:true},
    slug:{type:String, required:true, unique:true},
    creatAt:{type:Date, default:Date.now}
})

module.exports = mongoose.model("category", categorySchema)