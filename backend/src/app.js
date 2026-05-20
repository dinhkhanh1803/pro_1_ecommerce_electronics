import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";
import passport from "./config/passport.js";

const app = express();

const isProduction = process.env.NODE_ENV === "production";
const localDevOrigins = ["http://localhost:5173", "http://localhost:3000"];
const envOrigins = [process.env.CLIENT_URL, process.env.FRONTEND_URL]
  .filter(Boolean)
  .flatMap((value) => value.split(","))
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = isProduction
  ? [...new Set(envOrigins)]
  : [...new Set([...localDevOrigins, ...envOrigins])];

if (isProduction && allowedOrigins.length === 0) {
  throw new Error(
    "CORS misconfiguration: set CLIENT_URL or FRONTEND_URL in production environment.",
  );
}

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server and health checks without Origin header.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json());

app.use(passport.initialize());

app.use("/api", routes);

app.use(errorHandler);

export default app;
