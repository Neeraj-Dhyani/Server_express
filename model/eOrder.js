const mongoose = require("mongoose");
const {Schema} = mongoose;

const orderShema = new Schema({
   customerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  customerName:{
    type:String
  },
   products:[
     {
      productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      name: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true
      },
    }
  ],
  customerAddress:{
    type: String,
    required: true
  },
  orderDate:{
    type: Date,
    default: Date.now
  },
  shippingMethod: {
    type: String,
    enum: ["Standard", "Express", "Overnight"],
    default: "Standard"
  },
  status:{
    type:String,
    sts: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    default:"Pending"
  },
  totalAmount:{
    type: Number,
    required: true
  }
})

module.exports = mongoose.model("eOrder", orderShema)