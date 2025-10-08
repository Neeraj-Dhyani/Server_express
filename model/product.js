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
  ],
   ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      stars: { type: Number, min: 1, max: 5, required: true },
      review: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  averageRating: { type: Number, default: 0 },
})

productSchema.pre("save", function (next){
  if(!this.ratings||!Array.isArray(this.ratings)){
    this.ratings = []
  }
  if(this.ratings.length>0){
    const total = this.ratings.reduce((acc, r)=>acc+r.stars, 0)
    this.averageRating = total/this.ratings.length;
  }else{
    this.averageRating = 0
  }
  next();
})

let Product = mongoose.model("Products",  productSchema);

module.exports = Product;