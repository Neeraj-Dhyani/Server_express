const mongoose = require('mongoose');
const { Schema } = mongoose;

 
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  token:{
    type:String
  },
  tokenExpiry:{
    type:Date
  },
  phone: {
    type: String,
    required: true,
  },
  address:{
    type: String,
    default: 'user'
  },
  city:{
    type: String,
    default: 'user'
  },
  zipcode:{
    type: String,
    default: 'user'
  },
  country:{
    type: String,
    default: 'user'
  },
  state:{
    type: String,
    default: 'user'
  },
  cart: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    quantity: {
      type: Number,
      default: 1,
    },
    price:{
      type:Number
    },
    name:{
      type:String
    },
    image:{
      type: String
    },
    
  }],
  orders: [{
    type: Schema.Types.ObjectId,
    ref: 'Order',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },

}, { timestamps: true });

module.exports = mongoose.model('eUser', userSchema);
