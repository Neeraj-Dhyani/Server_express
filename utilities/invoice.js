const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path")

const invoiceDir = path.join(__dirname, "../invoices")
if(!fs.existsSync(invoiceDir)){
    fs.mkdirSync(invoiceDir, {recursive:true})
}
const invoiceHTML = (order) =>`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Invoice</title>

  <style>
    body {
      font-family: Arial, sans-serif;
      color: #333;
      padding: 30px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }

    .company h2 {
      margin: 0;
      color: #2c3e50;
    }

    .invoice-title {
      text-align: right;
    }

    .invoice-title h1 {
      margin: 0;
      color: #34495e;
    }

    .details {
      margin-bottom: 30px;
    }

    .details p {
      margin: 4px 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    th, td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }

    th {
      background-color: #f4f6f8;
    }

    .total-section {
      margin-top: 20px;
      text-align: right;
    }

    .total-section h3 {
      margin: 5px 0;
    }

    .footer {
      margin-top: 40px;
      font-size: 12px;
      text-align: center;
      color: #777;
    }
  </style>
</head>

<body>

  <!-- HEADER -->
  <div class="header">
    <div class="company">
      <h2>Your Store Name</h2>
      <p>support@yourstore.com</p>
      <p>+91-XXXXXXXXXX</p>
    </div>

    <div class="invoice-title">
      <h1>INVOICE</h1>
      <p><strong>Invoice No:</strong> INV-${order._id}</p>
      <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
    </div>
  </div>

  <!-- CUSTOMER DETAILS -->
  <div class="details">
    <p><strong>Customer Name:</strong> ${order.customerName}</p>
    <p><strong>Email:</strong> ${order.customerEmail}</p>
    <p><strong>Shipping Address:</strong> ${order.customerAddress}</p>
    <p><strong>Shipping Method:</strong> ${order.shippingMethod}</p>
    <p><strong>Order Status:</strong> ${order.status}</p>
  </div>

  <!-- PRODUCTS TABLE -->
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Product Name</th>
        <th>Quantity</th>
        <th>Price</th>
        <th>Total</th>
      </tr>
    </thead>

    <tbody>
      ${order.products.map((item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>₹${item.price}</td>
          <td>₹${item.quantity * item.price}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <!-- TOTAL -->
  <div class="total-section">
    <h3>Grand Total: ₹${order.totalAmount}</h3>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <p>Thank you for shopping with us!</p>
    <p>This is a computer-generated invoice.</p>
  </div>

</body>
</html>
`;

async function generateInvoice(order){
    if(!order||!order._id){
        throw new Error("Order or Order id not found!") 
    }
    const order_id  = order._id.toString()
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    })
    const page = await browser.newPage()
     await page.setContent(invoiceHTML(order), {
        waitUntil : "networkidle0"
     })
    const pdgPath = path.join(invoiceDir, `invoice-${order_id}.pdf`)
    await page.pdf({
        path: pdgPath,
        format: "A4",
        printBackground: true  
    })

    await browser.close()
    return pdgPath
}

module.exports = {generateInvoice}