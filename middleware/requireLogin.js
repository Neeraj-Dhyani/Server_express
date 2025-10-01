let jwt = require("jsonwebtoken");
let User = require("../model/eUser");
require("dotenv").config();

module.exports = async (req, res, next)=>{
    const authorization = req.headers.authorization;
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
        let appuser =  await User.findById(decodedid.id);
        req.appuser = appuser;
        // console.log(appuser);
        next();
    } catch (error) {
        console.log(error);
    }
}