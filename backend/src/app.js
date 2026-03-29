import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";
import passport from "./config/passport.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(passport.initialize());

app.use("/api", routes);

app.use(errorHandler);

export default app;
