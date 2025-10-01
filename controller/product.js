const express = require("express");
const router = express.Router();
const Product = require("../model/product");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function(req, file, cd){
        cd(null, "./uploads")
    },
    filename: function(req, file, cd) {
         cd(null, `${Date.now()}-${file.originalname}`)
    }
})
const upload = multer({storage:storage});

router.post("/uploadproduct",  upload.none(), async(req, res)=>{
    const {itemCode, name, price,  category, description, hsnCode, gst, note, wash, timeToShip} = req.body;

    try {
        const verifyProduct = await Product.findOne({name})
        if(verifyProduct){
            return res.status(409).json({msg:"This product already added"})
        }
        const newproduct  =  new Product({
        itemCode, 
        name,
        category,
        price,
        hsnCode,
        gst,
        description,
        note,
        wash,
        timeToShip,
        variants:[]
    })
    await newproduct.save();
    res.status(200).json({msg:"product upload successfully!" , file:imagePath})

    } catch (error) {
        console.log(error)
    }

})
router.put("/uploadproductimg/:id", upload.array("images", 5), async(req, res)=>{
    const {id} = req.params;
    const {color, size} = req.body;
    const images= req.files.map(file => file.path.replace(/\\/g, "/"));
    try{
        const verifyProduct = await Product.findById(id)
        if(!verifyProduct){
            res.status(404).json({msg:"product not found !!"}) 
        }
        await Product.findByIdAndUpdate(id, {$push:{variants:{color, size, images}}},{new:true});
        res.status(200).json({msg:"image successfully added !"})
    }catch(err){
        res.status(400).json({msg:"somthing went wrong!", Error:err})
    }
    
})
router.get("/getallProduct", async (req, res)=>{
    try{
        let Productdb = await Product.find();
        let ProductData = Productdb.map(emp=>emp.toObject());
        res.status(200).json({product:ProductData});
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
router.put("/updatePriduct/:id", async(req, res)=>{
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
    res.status(200).json({msg:"Product Deleted Successfully!"})
   }catch(err){
    console.log(err);
   }

})

module.exports = router