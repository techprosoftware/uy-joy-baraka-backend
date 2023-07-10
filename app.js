const fs = require("fs");
const path = require("path");
const cors = require("cors");
const logger = require("morgan");
const express = require("express");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");

const { NODE_ENV, URL } = require("./config");
const db = require("./modules/postgres");
const swaggerDoc = require("./docs/swagger.json");
const limiter = require("./modules/rate-limit");
const compression = require("./modules/compression");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (NODE_ENV === "production") {
  app.use(limiter);
  app.use(cors({ origin: URL }));
  app.use(logger("common"));
} else {
  app.use(cors({ origin: "*" }));
  app.use(logger("dev"));
}

app.use(compression);
app.use(express.static(path.join(__dirname, "public")));

// swagger setup middleware
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// database middleware
app.use(async (req, res, next) => {
  req.db = await db();
  next();
});

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