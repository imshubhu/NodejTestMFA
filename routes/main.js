var express = require("express");
const authenticate = require("../middlewares/authenticate");
var authRouter = require("./auth");
var homeRouter = require("./home");

var app = express();

app.use("/auth", authRouter);
app.use("/home", authenticate, homeRouter);

module.exports = app;