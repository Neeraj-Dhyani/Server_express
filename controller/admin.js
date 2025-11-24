const express = require("express")
const router = express.Router()
const Admin = require("../model/admin")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const APIKEY = require("../model/api_key")
const api_key = require("../model/api_key")
const slugify = require("slugify")
const Category = require("../model/category")
const category = require("../model/category")

router.post("/creatAccount", async(req, res, next)=>{
    const {email, password} = req.body
    if(!email||!password){
        return res.status(400).json({msg:"please fill all field "})
    }
    try{
        const check_exitingUser = await Admin.findOne(email);
        if(check_exitingUser){
            return res.status(409).json({msg:"user already exiting"})
        }
        const hashpassowed = bcrypt.hash(password, 12)
        const admin =  new Admin({
            email,
            password:hashpassowed
        })
        await admin.save()
        return res.status(200).json({msg:"acount creat successfully"})
    }catch(err){
        next(err)
    }

})
router.post("/login", async(req, res, next)=>{
    const {email, password} = req.body
    if(!email||password){
        return res.status(400).json({msg:"pleas fill all the field!"})
    }
    try{
        const adminexiting = await Admin.findOne({email:email})
        if(!adminexiting){
            return res.status(404).json({msg:"admin not found"})
        }
        const correctpassword = await bcrypt(password, adminexiting.password)
        if(correctpassword){
            const token = jwt.sign({id:adminexiting._id}, process.env.SECRETKEY)
            return res.status(200).json({msg:"login successfully"})
        }else{
            return res.status(405).json({msg:"invailid user or password"})
        }
    }catch(err){
        next(err)
    }
})

router.get("/apikeygenerator", async(req, res, next)=>{
    try{
        function generateapikey(){
            return  crypto.randomBytes(32).toString("hex")
        }
        const new_key = generateapikey()
        await APIKEY.create({api_key:new_key})

        res.status(200).json({
            msg:"your API key generated successfully", 
            api_key:new_key 
        })
    }catch(err){
        next(err)
    }
})
router.post("/createcategory", async(req, res, next)=>{
    const {name} = req.body;
    try{
        const slug = slugify(name, {lower:true})
        const newCategory = await Category.create({name, slug})
        res.status(200).json({msg:"cotegory careated successfully"})
    }catch(err){
        next(err)
    }
})

router.get("/getallcategory", async(req, res, next)=>{
    try{
        const all_category = await Category.find()
        res.status(200).json({category:all_category})
    }catch(err){
        next(err)
    }
})

router.put("/updatecategory/:id", async(req, res, next)=>{
    const {id} = req.params
    const name = req.body
    const slug = slugify(name, {lower:true})
    try{
        const updated = await Category.findByIdAndUpdate(id, {name, slug}, {new:true})
        res.status(200).json({msg:"category updated successfully", update:updated})
        
    }catch(err){
       next(err)
    }
})
router.delete("/deletecategory/:id", async(req, res, next)=>{
    const {id} = req.params
    try{
        await Category.findByIdAndDelete(id)
        res.status(200).json({msg:"category deleted successfully"})
    }catch(err){
        next(err)
    }
})
module.exports = router;