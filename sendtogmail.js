const nodemailer = require("nodemailer");

async function SendDatatoGmail(order){
    const transtport = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"neerajdhyani47@gmail.com",
        pass:"gqme yppz oopo esok"
    }
    })
    const htmlBody = `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f6f8fb;padding:20px;">
      <div style="max-width:700px;margin:auto;background:#fff;border-radius:8px;box-shadow:0 0 10px rgba(0,0,0,0.05);overflow:hidden;">
        <div style="background:#0ea5a4;color:#fff;padding:16px 20px;">
          <h2 style="margin:0;">New Order Received</h2>
        </div>

        <div style="padding:20px;">
          <p>Hello Tarun,</p>
          <p>You have received a new order. Below are the details:</p>

          <h3 style="margin-top:24px;">Order Summary</h3>
          <p><strong>Order ID:</strong> ${order._id}</p>
           <p><strong>Order by:</strong> ${order.customerName}</p>
          <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Shipping Method:</strong> ${order.shippingMethod}</p>
          <p><strong>Customer Address:</strong> ${order.customerAddress}</p>

          <h3 style="margin-top:24px;">Products</h3>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr>
                <th style="text-align:left;padding:8px;border-bottom:1px solid #ddd;">Name</th>
                <th style="padding:8px;border-bottom:1px solid #ddd;">Qty</th>
                <th style="padding:8px;border-bottom:1px solid #ddd;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.products
                .map(
                  (p) => `
                <tr>
                  <td style="padding:8px;border-bottom:1px solid #eee;">${p.name}</td>
                  <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${p.quantity}</td>
                  <td style="padding:8px;border-bottom:1px solid #eee;">₹${p.price}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>

          <p style="margin-top:24px;">Order Date: ${new Date(
            order.orderDate
          ).toLocaleString()}</p>

          <p style="margin-top:30px;">Best Regards,<br><strong>Neeraj Dhyani Shop</strong></p>
        </div>
      </div>
    </div>
    `;
    transtport.sendMail({
        from:"neerajdhyani47@gamil.com",
        to:"tbisht333@gmail.com",
        subject:"New Order recieved",
        html:htmlBody
    })
    console.log("order sent successfully")
    // console.log(order);
}

module.exports = { SendDatatoGmail };