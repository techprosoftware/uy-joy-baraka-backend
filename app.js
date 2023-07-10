// var createError = require("http-errors");
const fs = require("fs");
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const compression = require("compression");
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./docs/swagger.json");
const db = require("./modules/postgres");
const limiter = require("./modules/rate-limit");
const { URL, NODE_ENV, PORT} = require("./config");
// const userMiddleware = require("./middlewares/user-middleware");
const cors = require("cors");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// middlewares
if (NODE_ENV === "production") app.use(limiter);

app.use(
  compression({
    level: 6,
    threshold: 0,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// swagger setup middleware
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// database middleware
app.use(async (req, res, next) => {
  req.db = await db();
  next();
});

// app.use(userMiddleware);

// routes
app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

const pathToRoutes = path.join(__dirname, "routes");
fs.readdir(pathToRoutes, (err, files) => {
  if (err) throw new Error(err);

  files.forEach((file) => {
    const Route = require(path.join(pathToRoutes, file));
    if (Route.path && Route.router) app.use(Route.path, Route.router);
  });

  // catch 404 and forward to error handler
  app.use("*", (req, res) => {
    res.status(404).json({
      ok: false,
      message: "Oops! Something is wrong.",
    });
  });
});

// error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    ok: false,
    message: err + "",
  });
});

module.exports = app;
