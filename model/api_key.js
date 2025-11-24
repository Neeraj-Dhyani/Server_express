const mongoose = require("mongoose")

const {Schema} = mongoose

const API_KEYschema = new Schema({
    api_key:{type:String, required:true},
    createdAt:{type:Date, default:Date.now}
})

module.exports = mongoose.model("APIKEY", API_KEYschema)