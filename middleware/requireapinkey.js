const API_KEY = require("../model/api_key")
module.exports = async (req, res, next)=>{
    const key = req.headers["x-admin-api-key"]
    try{
        if(!key){
        return res.status(401).json({error:"API key rquired"})
    }
    const valid_api_key = await API_KEY.findOne({api_key:key})
    if(!valid_api_key){
        return res.status(403).json({msg:"invailid api key"})
    }
    next()
    }catch(err){
        next(err)
    }
   

}