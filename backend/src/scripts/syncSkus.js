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

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log("Connecting to Database...");
    await mongoose.connect(mongoUri);
    console.log("Connected.");

    // Fetch all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products. Checking for missing SKUs...`);

    let updatedCount = 0;
    for (const p of products) {
      if (!p.sku) {
        const generatedSku = "SKU-" + Math.floor(10000000 + Math.random() * 90000000).toString();
        p.sku = generatedSku;
        await p.save();
        console.log(`Assigned SKU to Product: ${p.name} => ${generatedSku}`);
        updatedCount++;
      } else {
        console.log(`Product already has SKU: ${p.name} => ${p.sku}`);
      }
    }

    console.log(`\nSKU Sync complete. Updated ${updatedCount} products.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error("SKU Sync failed:", err);
  }
};

run();
