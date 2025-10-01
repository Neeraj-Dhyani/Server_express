const nodemailer = require("nodemailer");

async function SendDatatoGmail(order){
    const transtport = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"neerajdhyani47@gmail.com",
        pass:"gqme yppz oopo esok"
    }
    })
    transtport.sendMail({
        from:"neerajdhyani47@gamil.com",
        to:"tbist333@gmail.com",
        subject:"New Order recieved",
        html:`<h3>${order.prodocts[0].name}</h3>
        <div>price : ${order.prodocts[0].price}</div>
         <div>price : ${order.prodoct}</div>
        `
    })
    console.log("order sent successfully")
    // console.log(order);
}

module.exports = { SendDatatoGmail };