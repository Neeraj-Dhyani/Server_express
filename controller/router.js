const express = require("express")
const requireAdminLogin = require("../middleware/adminRequireLogin")
const Product  = require("../model/product")
const User = require("../model/eUser")
const Order = require("../model/eOrder")
const Category = require("../model/category")
const Coupon  = require("../model/coupon")
const routers  = express.Router()


routers.get("/home",  requireAdminLogin, async(req, res)=>{
    const total_user = await User.countDocuments()
    const total_product = await Product.countDocuments()
    const total_order  = await Order.countDocuments()
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
routers.get("/createBanner", requireAdminLogin, async(req, res)=>{
    res.render("baner/addBanner", {apikey:JSON.stringify(process.env.ADMIN_API_KEY)})
})
routers.get("/allBanners", requireAdminLogin, async(req, rez)=>{
    res.render("baner/allBanner")
})
routers.get("/createCoupon", requireAdminLogin, (req, res)=>{
    res.render("coupon/createCoupon", {apikey:JSON.stringify(process.env.ADMIN_API_KEY)})
})
routers.get("/allCoupons", requireAdminLogin, async(req, res)=>{
    try{
        let allCoupon = await Coupon.find().lean()
        res.render("coupon/allCoupon", {coupon:allCoupon, apikey:JSON.stringify(process.env.ADMIN_API_KEY)})
    }catch(err){

    }

    
})
routers.get("/allOrders", requireAdminLogin, async(req, res)=>{
    try{
        const all_orders = await Order.find().lean()
        res.render("orders/allOrders", {orders:all_orders, apikey:process.env.ADMIN_API_KEY})
    }catch(err){
        console.log(err)
    }
   
})
routers.get("/viewOrder/:id", requireAdminLogin, async(req, res)=>{
    try{
        let id  = req.params.id;
        let order = await Order.findById({_id:id}).lean()
        // console.log(order)
        res.render("orders/orders_detail", {order})
    }catch(err){
        console.log(err)
    }
})
module.exports = routers