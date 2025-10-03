const express = require('express');
const router = express.Router();
const User =  require("../model/eUser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const requireLogin = require("../middleware/requireLogin");
const Product  = require("../model/product");
const Order = require("../model/eOrder");
const {SendDatatoGmail }= require("../sendtogmail");
const lookup = require("country-code-lookup")
const crypto = require("crypto");
const {VerificationCode} = require('../SendVerificationCode');
const pwnedpassword = require('pwnedpasswords');
const { json } = require('stream/consumers');
const { error } = require('console');
require("dotenv").config();
// ------------------------------user register-------------------------------------------------->
router.post("/registerUser", async(req, res, next)=>{
    let {name, email, username, password, phone, address, city, zipcode, state, country} = req.body;

    if(!name||!email||!username||!password||!phone||!address||!state||!country||!city||!zipcode){
         return res.status(400).json({msg:"please enter all fields"})
    }
    try{
         let exitingUser = await User.findOne({email})
         if(exitingUser){
            return res.status(409).json({msg:"user already exiting"})
         }
         let hashpassowed = await bcrypt.hash(password, 12)
         const token = ""
         const tokenExpiry = Date.now() + 3600000;

         let newuser =  new User({
            name, 
            email,
            username,
            password:hashpassowed,
            phone, 
            address, 
            city,
            zipcode, 
            state, 
            country,
            token,
            tokenExpiry, 
        })
        await newuser.save();
        return res.status(200).json({msg:"register successfully"});

    }catch(err){
        next(err)
    }
});
router.post("/checkpassword", async (req, res)=>{
    const {password} =  req.body
    try{
        const count = await pwnedpassword(password)
        res.status(200).json({count:count});
    }catch(err){
        res.status(404).json({msg:err})
    }
})
router.get("/getCountryiso/:country", (req, res, next)=>{
    
   try{
        const country = req.params.country;
        let isocode = lookup.byCountry(country);
        if(!isocode){
            return res.status(404).json({msg:"Country not found"})
        }
        res.status(200).json({code:isocode.iso2})
   }catch(err){
     next(err)
   }
})
router.post("/sendVerification", async(req, res, next)=>{
    const {email} = req.body;
    console.log(email)
    try{
        const verifyEmail = await User.findOne({email})
        if(!verifyEmail){
            return res.status(404).json({msg:"User email not found!"});
        }
        const token = crypto.randomBytes(32).toString('hex');
        await User.findOneAndUpdate({email:email}, {$set:{token:token, tokenExpiry:Date.now() + 3600000 }}, { new: true });
        VerificationCode(verifyEmail, token);
        res.status(200).json({msg:"successfully sent on your email"});
    }catch(err){
        next(err)
    }
})
router.put("/forgotPassword", async(req, res, next)=>{
    const {token, resetpassword} = req.body;
    try{
        const user = await User.findOne({token, tokenExpiry:{$gt:Date.now()}}) 
        if(!user){
            return res.status(404).json({msg:"token is not velid or expire"})
        }
        const hashpassword = await bcrypt.hash(resetpassword, 12)
        user.password = hashpassword;
        user.token = undefined;
        user.tokenExpiry = undefined;
        await user.save();
        res.status(200).json({msg:"password resset successfully"});

    }catch(err){
        next(err)
    }
})
// -----------------------------------user login------------------------------------------------>
router.post("/login", async(req, res, next)=>{
    let {username, password} = req.body;
    if(!username||!password){
        return res.status(422).json({msg:"pleas fill all fields!"})
    }
    try{
        let userexiting = await User.findOne({username :username});
        if(!userexiting){
            return res.status(400).json({msg:"user not valid"})
        }
        let correctpassword = await bcrypt.compare(password, userexiting.password);;
        if(correctpassword){
            let token = jwt.sign({id:userexiting._id},process.env.SECRETKEY)
            res.status(200).json({token , msg:"login succussefully"});
            
        }else{
        return res.status(405).json({msg:"invailid user and password"})
        }
     }catch(err){
        next(err)
    }
})
router.get("/userprotection", requireLogin, async(req, res, next)=>{
    try{
         res.status(200).json({msg : req.appuser});
    }catch(err){
        next(err)
    }
   
});
// --------------------------------update user--------------------------------------------->
router.put("/changeEmail", requireLogin, async(req, res, next)=>{
    const userid = req.appuser._id;
    const{email} = req.body
    try{
        const user = await User.findByIdAndUpdate(userid, {email}, {new:true}, { runValidators: true});
        res.status(200).json({msg:"email change successfully", user})
    }catch(err){
        next(err)
    }
})
router.put("/changePhonenumber", requireLogin, async(req, res, next)=>{
    const userid = req.appuser._id;
    const  {phone}= req.body
    try{
        const user = await User.findByIdAndUpdate(userid, {phone}, {new:true}, { runValidators: true});
        res.status(200).json({msg:"phone number change successfully", user}, {new:true}, { runValidators: true})
    }catch(err){
        next(err)
    }

})
router.put("/updateAddress", requireLogin, async(req, res, next)=>{
    const userid = req.appuser._id;
    const {address} = req.body;
    try{
        const user = await User.findByIdAndUpdate(userid, {address}, {new:true}, { runValidators: true});
        res.status(200).json({msg:"address change successfully", user})
    }catch(err){
        next(err)
    }

});
router.delete("/deleteUser", requireLogin, async(req, res, next)=>{
    const userid = req.appuser._id
    try{
        const deleteUser = await User.findByIdAndDelete(userid);
        if(!deleteUser){
            return res.status(404).json({ msg: "User not found" })
        }
        res.status(200).json({msg:"Deleted successfully!!"})
    }catch(err){
        next(err)
    }
    
})
// --------------------------------add to cart------------------------------------------------>
router.put("/addtocart", requireLogin, async(req, res, next)=>{
    let userid = req.appuser._id
    let {product_id, quantity} = req.body

    try{
        let productdata = await Product.findById(product_id)
        const image = productdata.variants[0].images[0];
        const price = productdata.price;
        const name = productdata.name;
        console.log(productdata);
        let user = await User.findById(userid)
        let itemindex = user.cart.findIndex((item) => {
            return item.product.toString() === product_id;
        });
        // console.log(itemindex);
        if(itemindex > -1 ){
            user.cart[itemindex].quantity += quantity;
        }else{
            user.cart.push({product:product_id, quantity, image, price, name});
        }
        await user.save();
        return res.status(200).json({ message: "Product added to cart", cart: user.cart });
    }catch(err){
        next(err)
    }
});
router.put("/addquantity", requireLogin, async(req, res, next)=>{
    let userid = req.appuser._id
    let {product_id} = req.body
    try{
        let user = await User.findById(userid);
        let itemindex = user.cart.findIndex((item) => {
            return item.product.toString() === product_id;
        });
        if(itemindex > -1 ){
            user.cart[itemindex].quantity += 1;
            await user.save();
            return res.status(200).json({ message: "Product added to cart", cart: user.cart });
        }else{
            res.status(400).json({msg:"somthing went wrong"})
        }

    }catch(err){
        next(err)
    }  
});
router.put("/decreasequantity", requireLogin, async(req, res, next)=>{
    let userid = req.appuser._id
    let {product_id} = req.body
    try{
        let user = await User.findById(userid);
        let itemindex = user.cart.findIndex((item) => {
            return item.product.toString() === product_id;
        });
        if(itemindex > -1 ){
            user.cart[itemindex].quantity -= 1;
            if(user.cart[itemindex].quantity === 0){
                user.cart.pull({product:product_id});
                return 
            }
            await user.save();
            return res.status(200).json({ message: "Product decrease to cart", cart: user.cart });
            
        }

    }catch(err){
        next(err)
    }
});
// --------------------------------------remove to cart--------------------------------------->
router.delete("/removetocart", requireLogin, async(req, res, next)=>{
    let userid = req.appuser._id
    let {product_id} = req.body

    try{
        let user = await User.findById(userid);
        user.cart.pull(product_id);
        await user.save();
        return res.status(200).json({ message: "Product removed to cart", cart: user.cart });
    }catch(err){
        next(err)
    }
});
// --------------------------------------------place order------------------------------------>
router.post("/placeOrder", requireLogin, async(req, res)=>{
    // console.log(req.appuser);
    const {productID} = req.body;
    const user_Id = req.appuser._id;
    // const findproduct= req.appuser.cart.find((item)=>item.product == productID);
    const quantity = findproduct.quantity;
    const customer_Address = req.appuser.addresse

    try{
        let {name, price} = await Product.findById(productID);
        let totalamount = price*quantity;
        const customer_Order = new Order({
            customerID:user_Id,
            products:[{
                productID,
                name,
                quantity,
                price
            }],
             customerAddress:customer_Address,
            totalAmount:totalamount
        })
        await customer_Order.save();
        let user = await User.findByIdAndUpdate(user_Id, {$push:{orders:customer_Order._id}})
        res.status(201).json({ message: "Order placed successfully", order: customer_Order, userorder:user});
        SendDatatoGmail(customer_Order);
    }catch(err){
        console.log(err)
        res.status(500).json({ msg: "Something went wrong while placing the order", error:err});
    }

});

module.exports = router;