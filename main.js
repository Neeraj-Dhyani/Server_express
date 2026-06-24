const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const { default: mongoose, trusted } = require("mongoose");
let cors = require("cors");
const engin = require("express-handlebars").engine
require("dotenv").config();
const path = require("path");
const cookie_parser = require("cookie-parser")
const method_override = require("method-override")
app.set('trust proxy', true); 
let PORT = process.env.PORT ||5000;
// -----------------------------------middleware--------------------------------
app.set('trust proxy', true); 

const adminIpWhitelist = (req, res, next)=>{
  // const  clientIP = req.ip|| req.headers["x-forwarded-for"]||req.socket.remoteAddress;
   let clientIP = req.headers["x-forwarded-for"] 
    ? req.headers["x-forwarded-for"].split(",")[0]
    : req.socket.remoteAddress;
  const allowedIp = process.env.MY_ADMIN_IP.trim()
  console.log("client ip : ", clientIP)
  if(clientIP===allowedIp||clientIP==='::1'||clientIP==='127.0.01'){
    next()
  }else{
    res.status(404).send("Not Found")
  }
}
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookie_parser())
app.use(method_override("_method"))
const allowedOrigins = [
  "http://localhost:5173",
  "https://yourfrontenddomain.com",
  "https://postasthmatic-fumiko-imprescriptibly.ngrok-free.dev",
  "http://localhost:5000"
]
app.use(cors({
    origin: function (origin, callback){
      if(!origin||allowedOrigins.includes(origin)){
        callback(null, true)
      }else{
        callback(new Error("Coros not allowed"))
      }
    },
    credentials:true
}))
app.use((req, res, next)=>{
  res.locals.BASE_URL = process.env.BASE_URL||""
  next()
})
// ----------------------------------handlebars setup----------------------------
app.engine('hbs', engin({
  extname:"hbs",
  helpers:{
    increament(value){
      return value +=1
    },
    multiply(a, b){
      return a*b
    },
    equal(a, b){
      return a === b
      },
    or(){
      return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
    },
    Date(date){
      return new Date(date).toLocaleDateString("en-IN")
    },  
    checkExpiry(date){
      if(date > Date.now()){
        return true
      }else{
        return false
      }
      }
    },
    
  partialsDir:path.join(__dirname, "views/partials")
}))
app.set('view engine', 'hbs')
app.set('views', "./views")

// ----------------------------------error maneging setup-------------------------
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    message: "Internal server error",
    error: err.message,
  });
});
// ----------------------------------Connnect Database-----------------------------
mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("database conected successfully!")
}).catch((err)=>{
    console.log(err);
})
// -----------------------------------routers---------------------------------------
app.get("/login", adminIpWhitelist, (req, res)=>{
    res.render("auth/login")
})


app.use(require("./controller/auth"))
app.use(require("./controller/product"))
app.use(require("./controller/chatbot"))
app.use(require("./controller/admin"))
app.use("/admin", adminIpWhitelist, require("./controller/router"))


app.listen(PORT, ()=>{
    console.log(`surver runnig on http://localhost:${PORT}`);
})