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

const userRouter = require("./routes/userRoutes");
const vehicleRouter = require("./routes/vehicleRoutes");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");

// start express app
const app = express();

app.enable("trust proxy");

// Middlewares

// Imprement cors
// app.use(cors());
// app.options("*", cors());

// set security HTTP headers
app.use(helmet());

// Development Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// limit Requests from same Ip
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this Ip, please try again in an hour",
});

app.use("/api", limiter);

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
app.use("/api/v1/users", userRouter);
app.use("/api/v1/vehicles", vehicleRouter);

// test middleware
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 400));
});

// error handling
app.use(globalErrorHandler);

// export app
module.exports = app;
