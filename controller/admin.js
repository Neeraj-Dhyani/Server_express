const express = require("express")
const router = express.Router()
const Admin = require("../model/admin")
const User = require("../model/eUser")
const Product = require("../model/product")
const Banner  = require("../model/banner")
const Order = require("../model/eOrder")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const APIKEY = require("../model/api_key")
const slugify = require("slugify")
const Busboy = require("busboy")
const fs = require("fs");
const path = require("path")
const Category = require("../model/category")
const Coupon = require("../model/coupon")
const requireapinkey = require("../middleware/requireapinkey")



router.post("/createAccount", async(req, res, next)=>{
    const {name, email, password} = req.body
    console.log(req.body)
    if(!name||!email||!password){
        return res.status(400).json({msg:"please fill all field "})
    }
    try{
        const check_exitingUser = await Admin.findOne({email:email});
        if(check_exitingUser){
            return res.status(409).json({msg:"user already exiting"})
        }
        const hashpassowed = await bcrypt.hash(password, 12)
        const admin =  new Admin({
            name,
            email,
            password:hashpassowed
        })
        await admin.save()
        return res.status(200).json({msg:"acount creat successfully"})
    }catch(err){
        next(err)
    }

})
router.post("/adminlogin", async(req, res, next)=>{
    const {email, password} = req.body
    if(!email||!password){
        return res.status(400).json({msg:"please fill all the fields!"})
    }
    try{
        const adminexiting = await Admin.findOne({email:email})
        if(!adminexiting){
            return res.status(404).json({msg:"admin not found"})
        }
        const correctpassword = await bcrypt.compare(password, adminexiting.password)
        if(correctpassword){
            const token = jwt.sign({id:adminexiting._id}, process.env.SECRETKEY)
            res.cookie("token", token, {
                httpOnly: true,
                secure: false,
                maxAge :20*60*60*100
            })
            return res.status(200).json({success:true, redirect:"/admin/home" ,token:token})
        
            
        }else{
            return res.status(405).json({msg:"invailid user or password"})
        }
    }catch(err){
        next(err)
    }
})
router.get("/logout", (req, res, next)=>{
    res.clearCookie("token");
    res.redirect("/login")
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
router.post("/createCategory", requireapinkey,async(req, res, next)=>{
    const {name} = req.body;
    try{
        const slug = slugify(name, {lower:true})
        const newCategory = await Category.create({name, slug})
        res.status(200).json({success:true, msg:"cotegory careated successfully"})
        
    }catch(err){
        next(err)
        res.redirect("addCartegory", {error:false})
    }
})

router.get("/getallcategory", requireapinkey, async(req, res, next)=>{
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

router.get("/getalluser", requireapinkey, async(req, res, next)=>{
    try{
        const all_user = User.find().select("-password")
        res.status(200).json({user:all_user})
    }catch(err){
        next(err)
    }
})
router.put("/blockuser/:id", async(req, res, next)=>{
    const {id} = req.params
    try{
        const user = User.findById(id)
        await User.findByIdAndUpdate(id, {isblock:true})
        res.status(200).json({ success:true, msg:`user ${user.name} is blocked`})
        res.redirect("allUser", {success:true})
    }catch(err){
        next(err)
    }
})
router.put("/unblockuser/:id",  async(req, res, next)=>{
    const {id} = req.params
    try{
        const user = User.findById(id)
        await User.findByIdAndUpdate(id, {isblock:false})
        res.status(200).json({ suucess:true ,msg:`user ${user.name} is unblocked`})
        res.redirect("allUser", {success:true})
    }catch(err){
        next(err)
    }
})
router.delete("/deleteuser/:id" , requireapinkey, async(req, res, next)=>{
    const {id} = req.params
    try{
        await User.findByIdAndDelete(id)
        res.status(200).json({success:true, msg:"user deleted successfully"})
    }catch(err){
        next(err)
    }
})

router.get("/getallorder", requireapinkey, async(req, res, next)=>{
    try{
        const all_order = await Order.find();
        res.status(200).json({success:true, order:all_order})
    }catch(err){
        next(err)
    }
})
router.put("/updateorderstatus/:id", async(req, res, next)=>{
    const id = req.params.id 
    const {order_status} = req.body
    try{
        const update_order_status  = await Order.findByIdAndUpdate(id, {status:order_status}, {new:true})
        res.status(200).json({success:true, msg:"order status change successfully"})
        res.render("/orders/allOrders")
    }catch(err){
        next(err)
    }
})
router.post("/createbanner", requireapinkey, async(req, res, next)=>{
    const busboy = Busboy({headers:req.headers})
    const title = "";
    const subtitle = "";
    const offer = "";
    const coupon = "";
    const images = [];
    
    const upload_image = path.join(__dirname, "../uploaded_Banner_image")
    if(!fs.existsSync(upload_image)){
            fs.mkdirSync(upload_image)
        }
    busboy.on("field", (fieldname, value) => {
    if (fieldname === "title") title = value;
    if (fieldname === "subtitle") subtitle = value;
    if (fieldname === "offer") offer = value;
    if (fieldname === "coupon") coupon = value;
  });

    busboy.on('file', (fieldname, file, {filename})=>{
        const savePath = path.join(upload_image, `${Date.now()}-${filename}`)
        const writeSteam = fs.createWriteStream(savePath)
        file.pipe(writeSteam)
        images.push(savePath)
    })
     busboy.on("finish", async()=>{
        try{
            const new_banner = await Banner.create({title, subtitle, offer, coupon, image:images[0]})
            res.status(200).json( {success:true, msg:"Banner create successfully"})
        }catch(err){
            res.status(400).json({msg:"somthing went wrong!", Error:err})
        }
    })
    req.pipe(busboy)
})
router.delete("deletebanner/:id", requireapinkey, async(req, res, next)=>{
    const {id} = req.params
    try{
        await Banner.findByIdAndDelete(id)
        res.status(200).json({success: true, msg:"Banner Deleted successfully"})
    }catch(err){
        next(err)
    }
})
router.post("/createCouponCode", requireapinkey, async(req, res, next)=>{
    const { 
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscount,
        expiryDate,
        maxUsage,
        description,
    } = req.body
    let code = ""
    code = String(crypto.randomBytes(4).toString("hex").toUpperCase());
      
   try{
     const new_coupon = await Coupon.create({
        code,
        discountType,
        discountValue,
        description,
        minOrderAmount,
        maxDiscount,
        expiryDate,
        maxUsage
    })
    res.status(201).json({success:true, msg:"coupon code successfully created", coupon:new_coupon})
   }catch(err){
    console.log(err)
    next(err)
   }

})
router.patch("/deactivCouponcode/:id",  requireapinkey, async(req, res, next)=>{
    try{
        await Coupon.findByIdAndUpdate(req.params.id, {active:false})
    }catch(err){
        next(err)
    }
})
router.delete("deletecouponcode/:id", requireapinkey, async(req, res, next)=>{
    try{
        await Coupon.findByIdAndDelete(id)
        res.status(200).json({msg:"coupon code sucessfully deleted"})
    }catch(err){
        next(err)
    }
})
router.get("/companystatus", requireapinkey, async(req, res, next)=>{
    try{
        const totall_User = await User.countDocuments()
        const totall_Prodcut = await Product.countDocuments()
        const totall_Order = await Order.countDocuments()
        const totall_Category = await Category.countDocuments()

        const order_paid = await Order.find({paymentStatus:"paid"})
        const total_revenue = order_paid.reduce((sum, order)=>{
            sum+order.totalAmount, 0})
        const monthly_sale  = await Order.aggregate([
           {
            $match:{
                status:"delivered"
            }
           },
           {
            $group:{
                _id:{$month:"$createdAt"},
                total_sale:{$sum:"$totalAmount"},
                total_order:{$sum:1}
            }
        },
        {
            $sort:{
                "_id":1
            }
        }
        ])    
        res.status(200).json({
            success:true, 
            user:totall_User,
            poroduct:totall_Prodcut,
            order:totall_Order,
            category:totall_Category,
            ravenue:total_revenue,
            sales:monthly_sale

        })
    }catch(err){
        next(err)
    }
})
module.exports = router;