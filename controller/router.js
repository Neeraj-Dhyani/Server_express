const express = require("express")
const requireAdminLogin = require("../middleware/adminRequireLogin")
const Product  = require("../model/product")
const User = require("../model/eUser")
const Oder = require("../model/eOrder")
const Category = require("../model/category")
const { assign } = require("nodemailer/lib/shared")
const routers  = express.Router()


routers.get("/home",  requireAdminLogin, async(req, res)=>{
    const total_user = await User.countDocuments()
    const total_product = await Product.countDocuments()
    const total_order  = await Oder.countDocuments()
    const totall_category = await Category.countDocuments()
    
    res.render("home", {
        user: total_user,
        product: total_product,
        order: total_order,
        category:totall_category
    })
})
routers.get("/allProduct", requireAdminLogin, (req, res)=>{
    res.render("product/allProduct", {apikey:JSON.stringify(process.env.ADMIN_API_KEY)})
})
routers.get("/addProduct", requireAdminLogin, (req, res)=>{
    res.render("product/addProduct", {apikey:JSON.stringify(process.env.ADMIN_API_KEY)})
})
routers.get("/editProduct/:id", requireAdminLogin, async(req, res)=>{
    try{
        const edit_Product  = await Product.findById(req.params.id)
        res.render("product/editProduct", {product_data:edit_Product.toObject()})
    }catch(err){
        console.log(err)
    }
    
})
routers.get("/addVariant/:id", requireAdminLogin, async(req, res)=>{
    res.render("product/addVariant", {id:req.params.id})
})
routers.get("/addCategory", requireAdminLogin, async(req, res)=>{
    res.render("category/addCategory", {apikey:JSON.stringify(process.env.ADMIN_API_KEY)})
})
routers.get("/allCategory", requireAdminLogin, (req, res)=>{
    res.render("category/allCategory", {apikey:JSON.stringify(process.env.ADMIN_API_KEY)})
})
routers.get("/allUser", requireAdminLogin, async(req, res, next)=>{
     try{
            const all_user = await User.find().select("-password")
            const User_data  = all_user.map(user=>user.toObject())
            res.render("user/allUser", {User_data})
        }catch(err){
            next(err)
        }
})
module.exports = routers