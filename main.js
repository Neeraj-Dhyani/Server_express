const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
let cors = require("cors");
require("dotenv").config();
const path = require("path");
let PORT = process.env.PORT ||5000;

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors({
    origin:["http://localhost:5173", "http://localhost:5174"],
    credentials: true  
}))

mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("database conected successfully!")
}).catch((err)=>{
    console.log(err);
})

app.use(require("./controller/auth"))
app.use(require("./controller/product"))

app.listen(PORT, ()=>{
    console.log(`surver runnig on http://localhost:${PORT}`);
})