var express = require("express");
var path = require("path");
var logger = require("morgan");
require("dotenv").config();
var apiRouter = require("./routes/main");
var apiResponse = require("./helpers/apiResponse");
var cors = require("cors");
const port = process.env.PORT || 3000;

var app = express();

app.use(logger("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//To allow cross-origin requests
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello JWT");
});
//Route Prefixes
app.use("/api", apiRouter);
app.use(express.static("public"));

// throw 404 if URL not found
app.all("*", function (req, res) {
  return apiResponse.notFoundResponse(res, "Api Url not found");
});

app.use((err, req, res) => {
  if (err.name == "UnauthorizedError") {
    return apiResponse.unauthorizedResponse(res, err.message);
  }
});

app.listen(port, () => {
  console.log(`Express is running on port ${port}`);
});

module.exports = app;
