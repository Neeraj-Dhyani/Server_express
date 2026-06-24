const express = require("express");
const router = express.Router();
const Product = require("../model/product");
const Busboy = require("busboy")
const fs = require("fs")
const path = require("path")
const requireLogin = require("../middleware/requireLogin");
const { trusted } = require("mongoose");
const requireapinkey = require("../middleware/requireapinkey");
const Category = require("../model/category")
const csv = require("csv-parser")
const cloudinary = require("cloudinary").v2
cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET 
})

router.post("/uploadproduct", requireapinkey, async(req, res)=>{
    const {itemCode, name, price,  category, description, gst, note, product_title, product_details, fabric, neckline, sleeve_length, occasion, wash_care, size_and_fit_note,  } = req.body;

    try {
        const verifyProduct = await Product.findOne({name})
        if(verifyProduct){
            return res.status(409).json({msg:"This product already added"})
        }
        const newproduct  =  new Product({
        itemCode, 
        name,
        product_details,
        product_title,
        category,
        price,
        fabric,
        neckline,
        sleeve_length,
        occasion,
        wash_care,
        gst,
        description,
        size_and_fit_note,
        note,

        variants:[],
    })
    await newproduct.save();
    res.status(200).json({success:true, msg:"product upload successfully!"})

    } catch (error) {
         res.status(500).json({ message: "Internal server error", error: error.message });
    }

})
router.post("/uploadCSV", requireapinkey, async(req, res, next)=>{
    const busboy = Busboy({headers:req.headers})
    busboy.on("file", (fieldname, file, info)=>{
        haseFile = true

        file.pipe(csv())       
    })
})
router.put("/uploadproductimg/:id",async(req, res)=>{
    const busboy = Busboy({
        headers:req.headers,
        limits:{
            fileSize: 10*1024*1024
        }
    })
    const {id} = req.params;
    let color= '' 
    let size = ''
    let images = []
    let all_UploadResults = []
    busboy.on("field", (filedname, value)=>{
        if(filedname === "color") color = value;
        if(filedname === "size") size = value.split(/\s+/);
    })
    busboy.on("file", (fieldname, file, info)=>{
        try{
            const uploadResult = new Promise((resolve, reject)=>{
                const stream = cloudinary.uploader.upload_stream(
                    {
                    folder:"Product_image",
                    resource_type:"image"
                    }, 
                    (error, result)=>{
                        if(error){
                            reject(error)
                        }
                        if(!result||!result.secure_url){
                            return reject(new Error("Cloudnary retrun no result"))
                        }
                        const imageData = {url:result.secure_url}
                        images.push(imageData)
                        resolve(result.secure_url)
                    })
                    file.pipe(stream)
            })
            all_UploadResults.push(uploadResult)
        }catch(err){
            console.log("cloudinary upload error : " ,err)
        }
    })
    // const images= req.files.map(file => file.path.replace(/\\/g, "/"));
    busboy.on("finish", async()=>{
        try{
        await Promise.all(all_UploadResults)
        if (!images.length) {
        return res.status(400).json({ msg: "No images uploaded" });
        }
        const verifyProduct = await Product.findById(id)
        if(!verifyProduct){
            res.status(404).json({msg:"product not found !!"}) 
        }
        await Product.findByIdAndUpdate(id, {$push:{variants:{color, size, images}}},{new:true});
        // res.status(200).json({ success:true, msg:"image successfully added !"})
        return res.redirect(`/admin/addVariant/${id}`)
    }catch(err){
        // res.status(400).json({msg:"somthing went wrong!", Error:err})
        res.redirect(`/admin/addVariant/${id}`, {success:true})
    }
    })
    req.pipe(busboy)
    
})

router.get("/getallProduct", requireapinkey,async (req, res)=>{
    try{
        let Productdb = await Product.find();
        res.status(200).json({product:Productdb});
    }catch(err){
        console.log(err);
    }
})

router.get("/getProductbyid/:id", async(req, res)=>{
    let productId = req.params.id;
    try{
        const product =  await Product.findById(productId);
        res.status(200).json({pt: product});
    }catch(err){
        console.log(err)
    }
})
router.get("/getProductbycategory/:slug", requireapinkey, async(req, res)=>{
    let slug = req.params.slug
    try{
        const category = await Category.findOne({slug:slug})
        if(!category){
            return res.status(404).json({msg:"category not found"})
        }
        const all_product_by_category = await Product.find({category:category._id})
        if(!all_product_by_category.length === 0){
            return res.status(404).json({msg:"category not found"})
        }
        res.status(200).json({product:all_product_by_category})
    }catch(err){
        console.log(err)
    }
})
router.get("/searchProdcut", async(req, res)=>{
    const {searchvalue} = req.query
    try{
        const Searchproduct = await Product.find({name:{$regex:searchvalue, $options:"i"}})
        if(Searchproduct.length === 0){
            return res.status(404).json({msg:"Product not Found"})
        }
        res.status(200).json({msg:"this is your product", product:Searchproduct});
    }catch(err){
        console.log(err)
    }
})

router.put("/updateProduct/:id", async(req, res)=>{
    try{
        let id = req.params.id
        let body = req.body
        await Product.findByIdAndUpdate(id, body);
        res.status(200).json({msg:"update successfully"})


    }catch(err){
        console.log(err)
    }
})
router.delete("/deleteProduct/:id", async(req, res)=>{
   try{
    const id = req.params.id;
    await Product.findByIdAndDelete(id);
    res.status(200).json({success:true, msg:"Product Deleted Successfully!"})
   }catch(err){
    console.log(err);
   }

})

router.put("/ProductRating/:id", requireLogin ,async (req, res)=>{
    const id = req.params.id
    const user_id = req.appuser._id
    const {rating_num, review_txt} = req.body

    try{
       const product = await Product.findById(id);
       console.log(product)
       if(!product){
         return res.status(404).json({msg:"Product not found"})
       }
       const exiting_user = product.ratings.find((value)=>{
            value.user.toString() === user_id.toString( )
            })
        if(exiting_user){
        exiting_user.stars = rating_num,
        exiting_user.review = review_txt
       }else{    
       product.ratings.push({
            user:user_id,
            stars:rating_num,
            review:review_txt
        })
        }
       
       await product.save()
       res.status(200).json({msg:"Thanks for rating", average: product.averageRating });

    }catch(err){
        console.log(err)
        res.status(500).json({ error: "Server error while rating product",})
    }
})

module.exports = router