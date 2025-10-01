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
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    message: "Internal server error",
    error: err.message,
  });
});
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