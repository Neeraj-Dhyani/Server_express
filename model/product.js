const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema; 

let productSchema = new Schema({
  itemCode: { type: String, required: true, unique: true },
  name: { type: String },
  category: { type: String, required: true }, 
  price: { type: String, required: true },
  hsnCode: { type: String },
  gst: { type: String },  
  description: { type: String },
  note: { type: String },
  wash: { type: String },
  timeToShip: { type: String },
  variants: [
    {
      color: String,
      images: [String],
      size: [String],  
      extra: mongoose.Schema.Types.Mixed 
    }
  ]
})

let Product = mongoose.model("Products",  productSchema);

module.exports = Product;