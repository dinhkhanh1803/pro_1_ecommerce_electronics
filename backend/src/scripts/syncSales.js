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
    console.log("Connecting to Database...");
    await mongoose.connect(mongoUri);
    console.log("Connected.");

    // Fetch all products
    const products = await Product.find({});
    const salesMap = {};
    for (const p of products) {
      salesMap[p._id.toString()] = 0;
    }

    // Fetch all orders that are not cancelled
    const orders = await Order.find({ orderStatus: { $ne: "cancelled" } });
    console.log(`Analyzing ${orders.length} non-cancelled orders to calculate sales...`);

    for (const order of orders) {
      for (const item of order.products) {
        if (item.product) {
          const productIdStr = item.product.toString();
          const quantity = Number(item.quantity) || 0;
          if (productIdStr in salesMap) {
            salesMap[productIdStr] += quantity;
          } else {
            salesMap[productIdStr] = quantity;
          }
        }
      }
    }

    console.log("Updating product sales in DB...");
    for (const productIdStr of Object.keys(salesMap)) {
      const salesCount = salesMap[productIdStr];
      const prod = products.find(p => p._id.toString() === productIdStr);
      const prevSales = prod ? prod.sales : 0;
      
      await Product.findByIdAndUpdate(productIdStr, { sales: salesCount });
      console.log(`Product: ${prod ? prod.name : productIdStr} | Prev sales: ${prevSales} => New sales: ${salesCount}`);
    }

    console.log("Migration complete.");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Migration failed:", err);
  }
};

run();
