let nodemailer = require("nodemailer");

async function VerificationCode(email, token){
    const transtport = nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:"neerajdhyani47@gmail.com",
            pass:"gqme yppz oopo esok"
        }
        })
        transtport.sendMail({
            from:"neerajdhyani47@gmail.com",
            to:"manojdhyani565@gmail.com",
            subject:"Verification Code",
            html:`<h1>Your Verification Code</h1><br><div>your token: ${token}</div>`
        })
}
module.exports = {VerificationCode}