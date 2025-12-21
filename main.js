const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
let cors = require("cors");
const engin = require("express-handlebars").engine
require("dotenv").config();
const path = require("path");
const cookie_parser = require("cookie-parser")
const method_override = require("method-override")
const { json } = require("stream/consumers");
let PORT = process.env.PORT ||5000;

app.use("/uploads", express.static(path.join(__dirname, "Produce_image")));
app.use(express.json())
app.use(cookie_parser())
app.use(express.urlencoded({extended:true}))
app.use(method_override("_method"))
app.use(cors({
    origin:["http://localhost:5173",],
    credentials: true  
}))
app.engine('hbs', engin({
  extname:"hbs",
  partialsDir:path.join(__dirname, "views/partials")
}))
app.set('view engine', 'hbs')
app.set('views', "./views")


app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    message: "Internal server error",
    error: err.message,
  });
});
app.get("/login", (req, res)=>{
    res.render("auth/login")
})
mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("database conected successfully!")
}).catch((err)=>{
    console.log(err);
})

app.use(require("./controller/auth"))
app.use(require("./controller/product"))
app.use(require("./controller/chatbot"))
app.use(require("./controller/admin"))
app.use("/admin", require("./controller/router"))
app.listen(PORT, ()=>{
    console.log(`surver runnig on http://localhost:${PORT}`);
})