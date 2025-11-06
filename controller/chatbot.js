const express = require('express');
const router = express.Router();
const Product  = require("../model/product");
const Order = require("../model/eOrder");
const googel_ai = require('@google/generative-ai');
const googel_generative_ai = new googel_ai.GoogleGenerativeAI(process.env.API_KEY)
// ----------------------------------AI chatbort----------------------------------------------->
router.post("/chat_ai", async (req, res, next)=>{
    const user_message = req.body.message
    const ai_model = googel_generative_ai.getGenerativeModel({model:"gemini-2.5-flash"})
    try{
        let context = "";
        if(user_message.toLowerCase().includes("order")){
            context = "order"
        }else if( user_message.toLowerCase().includes("dresse")|| user_message.toLowerCase().include("duy")){
            context = "product"
        }
        let reply = ""
        if(context == "product"){
            const product = await Product.find().limit(5)
              const result = await ai_model.generateContent([ "You are a shopping assistant. Use this product data to answer user queries helpfully.",
              `product:${JSON.stringify(product)}`,
              `your quary: ${user_message}`
              ])
              reply = result.response.text();
        }else if(context === "order"){

            const result =  await ai_model.generateContent([ 
                 "You are a customer support assistant for an eCommerce site. Help users with order tracking and returns.",
                 user_message
              ])
              if(user_message.toLowerCase().includes("track")||user_message.toLowerCase().includes("return")){
               const order_id_match = user_message.match(/\b[0-9a-fA-F]{24}\b/)
               let order_info;
            //    console.log(order_id_match);
                if(order_id_match){
                    order_info = await Order.findById(order_id_match[0]);
                    const result = await ai_model.generateContent([  "You are a customer support assistant. Use the following order data to help the user:",
                        `Order data : ${JSON.stringify(order_info)}`, 
                        `user query: ${user_message}`])
                    reply = result.response.text()
                    res.status(200).json({respones:reply})
                }
                reply = result.response.text()
            }else{
                const result = await ai_model.generateContent(user_message)
                reply= result
                
              }
    
            }  
        res.status(200).json({ai_reasult:reply})
    }catch(err){
        next(err)
    
}})

module.exports = router;