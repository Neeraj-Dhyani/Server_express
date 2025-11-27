# Server Repository

> Node.js + Express server for the project (API + admin + file uploads + Stripe payments)

---

## Table of Contents

* [Overview](#overview)
* [Features](#features)
* [Prerequisites](#prerequisites)
* [Environment Variables](#environment-variables)
* [Install & Run](#install--run)
* [Useful Endpoints](#useful-endpoints)
* [Example HTML test client](#example-html-test-client)
* [CSS (for test client)](#css-for-test-client)
* [Database & Models (notes)](#database--models-notes)
* [File uploads](#file-uploads)
* [Stripe / Payments](#stripe--payments)
* [API Key generation](#api-key-generation)
* [Testing](#testing)
* [Contributing](#contributing)
* [License](#license)

---

## Overview

This repository contains the server for the project: a RESTful API built with **Node.js** and **Express**. It provides routes for authentication, product management, categories, coupon handling, file uploads (product images), and payment handling (Stripe). It is designed to be used together with a React frontend and a MongoDB database.

## Features

* Express-based API structure
* JWT authentication (recommended)
* MongoDB (Mongoose) models for products, users, coupons, orders
* Image upload endpoints (local storage or cloud adapters)
* Stripe payment integration
* API key generation endpoint

## Prerequisites

* Node.js (LTS)
* npm or yarn
* MongoDB (local or Atlas)
* Stripe account (for payments, optional)

## Environment Variables

Create a `.env` file in the repo root. Example variables used by this server:

```
MONGO_URI="mongodb://localhost:27017/ecommerce"
SECRETKEY="your_jwt_secret_here"
PORT=5000
STRIPE_SECRET_KEY="sk_test_..."
API_KEY="optional_external_api_key_here"
```

> Replace values with your secrets. Never commit `.env` to version control.

## Install & Run

```bash
# install
npm install

# run in development (with nodemon)
npm run dev

# or production
npm start
```

## Useful Endpoints (examples)

```
GET  /api/health               -> status
POST /api/auth/signup          -> create user
POST /api/auth/login           -> login
GET  /api/products             -> list products
GET  /api/products/:id         -> product details
POST /api/products             -> create product (admin)
PUT  /api/products/:id         -> update product (admin)
DELETE /api/products/:id       -> delete product (admin)
POST /api/uploads/product/:id  -> upload product images
POST /api/coupons              -> create coupon
POST /api/checkout             -> create Stripe checkout / payment
GET  /api/apikeygenerator      -> generate API key
```

Adjust routes to match your implementation.

## Example HTML test client

Below is a minimal HTML page you can drop in a `test-client` folder to quickly test your `/api/health` and product listing endpoints from a browser (CORS must be enabled on the server).

> Save as `test-client/index.html`.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Server Test Client</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main class="container">
    <h1>Server Test Client</h1>

    <section class="card">
      <h2>Health Check</h2>
      <button id="healthBtn">Check Health</button>
      <pre id="healthResult">-</pre>
    </section>

    <section class="card">
      <h2>List Products</h2>
      <button id="productsBtn">Fetch Products</button>
      <pre id="productsResult">-</pre>
    </section>
  </main>

  <script>
    const SERVER = 'http://localhost:5000'; // change if needed

    document.getElementById('healthBtn').addEventListener('click', async () => {
      try {
        const res = await fetch(`${SERVER}/api/health`);
        const text = await res.text();
        document.getElementById('healthResult').textContent = text;
      } catch (err) {
        document.getElementById('healthResult').textContent = 'Error: ' + err;
      }
    });

    document.getElementById('productsBtn').addEventListener('click', async () => {
      try {
        const res = await fetch(`${SERVER}/api/products`);
        const data = await res.json();
        document.getElementById('productsResult').textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        document.getElementById('productsResult').textContent = 'Error: ' + err;
      }
    });
  </script>
</body>
</html>
```

## CSS (for test client)

Save as `test-client/styles.css`.

```css
/* Minimal clean styling for the test client */
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f5f7fb;color:#111}
.container{max-width:900px;margin:48px auto;padding:16px}
h1{font-size:28px;margin-bottom:12px}
.card{background:#fff;border-radius:10px;padding:18px;margin-bottom:12px;box-shadow:0 6px 18px rgba(12,24,40,0.06)}
button{padding:10px 14px;border-radius:8px;border:1px solid rgba(12,24,40,0.06);cursor:pointer}
pre{background:#0b1220;color:#e6eef8;padding:12px;border-radius:8px;margin-top:12px;overflow:auto}
```

## Database & Models (notes)

* Use Mongoose and create models for `User`, `Product`, `Order`, `Coupon`, and `ApiKey`.
* Example fields you might already have:

  * `Coupon`: `code`, `discountType` (`percentage`|`fixed`), `discountValue`, `minOrderAmount`, `maxDiscount`, `expiryDate`, `maxUsage`.
  * `ApiKey`: store generated keys and metadata (createdAt, ownerId, usageCount).

## File uploads

* Provide a dedicated `/uploads` or `/api/uploads` route.
* Accept multipart/form-data and store to local disk or cloud (S3 / Cloudinary).
* Protect admin upload routes with authentication.
* Make sure to validate file size and file type.

## Stripe / Payments

* Use stripe SDK on the server (stripe-node) with `STRIPE_SECRET_KEY`.
* Provide endpoints to create payment intents or checkout sessions.
* Verify webhooks server-side for order fulfillment.

## API Key generation

* You might already have an endpoint similar to `/apikeygenerator`. Ensure generated keys are stored hashed or with strong entropy (e.g. `crypto.randomBytes(32).toString('hex')`).
* Return the key once to the creator and store a hashed version for lookup.

## Testing

* Use Postman or Insomnia to test your endpoints.
* Use the included `test-client` HTML to quick-check CORS + basic endpoints.

## Contributing

1. Fork the repo
2. Create a feature branch
3. Open a pull request with a clear description

## License

MIT © Neeraj Dhayni

---

*Notes:* If you want, I can also generate a full `server` folder skeleton (Express app, example routes, Mongoose models) or adapt this README to exactly match your server code (I have snippets from our previous chats like coupon schema, upload routes, api key generator, env examples). Just tell me which option you prefer and I will add it to the repository files.
