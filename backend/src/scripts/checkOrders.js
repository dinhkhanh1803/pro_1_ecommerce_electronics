import dns from "node:dns";
try {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
} catch (err) {
  console.warn("⚠️ Cannot override custom DNS:", err.message);
}
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Product from "../models/Product.js";
import Order from "../models/Order.js";

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log("Connecting to", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("Connected.");

    const products = await Product.find({});
    console.log(`Found ${products.length} products:`);
    for (const p of products) {
      console.log(`Product: ${p.name} | SKU: ${p.sku} | Sales in DB: ${p.sales}`);
    }

    const orders = await Order.find({});
    console.log(`\nFound ${orders.length} orders:`);
    for (const o of orders) {
      console.log(`Order ID: ${o._id} | Status: ${o.orderStatus} | Payment: ${o.paymentStatus} | Products:`);
      for (const item of o.products) {
        const prod = products.find(p => p._id.toString() === item.product?.toString());
        console.log(`  - Product ID: ${item.product} (${prod ? prod.name : 'Unknown'}) | Qty: ${item.quantity}`);
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

run();
