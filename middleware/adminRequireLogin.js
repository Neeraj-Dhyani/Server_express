let jwt = require("jsonwebtoken");
let Admin = require("../model/admin");
require("dotenv").config();

module.exports = async (req, res, next)=>{
    const authorization = req.cookies.token;
    // console.log(authorization)
    if(!authorization){
        res.status(401).json({msg:"login fisrt"})
    } 
    const token = authorization.replace("Bearer ", "").trim()
    
    if (!token) {
    return res.status(401).json({ msg: "Unauthorized: No token" });
  }
    const decodedid = jwt.verify(token, process.env.SECRETKEY);

    try{
        if(!decodedid){
            console.log("login two");
        }
        let appuser =  await Admin.findById(decodedid.id);
        req.appuser = appuser;
        // console.log(appuser);
        next();
    } catch (error) {
        console.log(error);
    }
}