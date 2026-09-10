import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import apiRoute from "./routes/api.route.js";
import { openapi } from "./docs/openapi.js";
dotenv.config();
const app = express();
const localOrigins = [
  "http://localhost:5173",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
  "http://127.0.0.1:5173",
];
const configuredClientOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  ...configuredClientOrigins,
  // Keep existing browser-based local development origins available even when
  // CLIENT_URL is configured for a deployed frontend.
  ...localOrigins,
]);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests such as curl/Postman with no Origin header
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      console.log("Blocked CORS origin:", origin);
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/health", (req, res) => res.json({ success: true, status: "ok" }));
app.get("/api-docs.json", (req, res) => res.json(openapi));
app.get("/api-docs", (req, res) =>
  res
    .type("html")
    .send(
      '<!doctype html><html><head><title>JobPortal API docs</title><link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css"></head><body><div id="swagger-ui"></div><script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script><script>SwaggerUIBundle({url:"/api-docs.json",dom_id:"#swagger-ui"})</script></body></html>',
    ),
);
// Establish MongoDB lazily for API invocations. Vercel imports this module once
// per warm instance, so the cached connector in utils/db.js is reused.
const ensureDatabase = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
};
app.use("/api/v1", ensureDatabase);
app.use("/api/v1", apiRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found." }),
);
app.use((error, req, res, next) => {
  console.error(error);
  if (error.name === "MulterError")
    return res
      .status(400)
      .json({
        success: false,
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "File must be 5 MB or smaller."
            : "Invalid file upload.",
      });
  if (error.name === "ValidationError")
    return res.status(400).json({ success: false, message: error.message });
  if (error.code === 11000)
    return res
      .status(409)
      .json({
        success: false,
        message: "A record with this value already exists.",
      });
  if (error.name === "CastError")
    return res
      .status(400)
      .json({ success: false, message: "Invalid resource id." });
  res
    .status(error.status || 500)
    .json({
      success: false,
      message:
        error.status && error.status < 500
          ? error.message
          : "Internal server error.",
    });
});
const PORT = process.env.PORT || 8000;
const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running at port ${PORT}`));
};
// Vercel invokes the default-exported app as a Function. Local development
// retains the existing startup behavior and npm scripts.
if (!process.env.VERCEL) {
  start().catch((error) => {
    console.error("Unable to start server", error);
    process.exit(1);
  });
}

export { app };
export default app;
