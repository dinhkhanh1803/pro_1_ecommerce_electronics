import dns from "node:dns";
try {
  if (process.env.NODE_ENV !== "production") {
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
  }
} catch (err) {
  console.warn("⚠️ Cannot override custom DNS:", err.message);
}

import app from "./app.js";
import connectDB from "./config/db.js";
import env from "./config/env.js";

const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
