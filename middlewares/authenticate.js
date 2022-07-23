require("dotenv").config();
const jwt = require("jsonwebtoken");
const apiResponse = require("../helpers/apiResponse");
const authenticate = (req, res, next) => {
  // read the token from header authorization bearer or url

  const header = req.headers["authorization"] || req.query.token;
  const token = header.split(" ")[1];

  // token does not exist
  if (!token) {
    return apiResponse.ErrorResponse(res, "not logged in");
  }

  // verify token
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) return apiResponse.ErrorResponse(res, err);
    req.user = user;
    next();
  });
};

module.exports = authenticate;
