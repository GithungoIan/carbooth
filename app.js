const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const path = require("path");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");

// start express app
const app = express();

app.enable("trust proxy");

// Middlewares

// Imprement cors
app.use(cors);
app.options("*", cors());

// set security HTTP headers
app.use(helmet());

// Development Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// limit Requests from sme Ip
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this Ip, please try again in an hour",
});

app.use("/api/v1/login", limiter);

// Body prser, readin data from body in req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// data Sanitiztion aganist NOSQl Injection
app.use(mongoSanitize());

// Data sanitiztion aginst xss
app.use(xss());

// Prevent Parameter Polution
app.use(
  hpp({
    whitelist: ["make", "model"],
  })
);

// Compress api requests
app.use(compression());

// routes

// test middleware

// error handling

// export app
module.exports = app;
