const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { constants } = require("../helpers/constant");

/**
 * User registration.
 *
 * @param {string}      username
 * @param {string}      password
 * @param {string}      qualification
 * @param {string}      city
 * @param {number}      phonenumber
 *
 * @returns {Object}
 */
exports.register = [
  // Validate fields.
  body("username")
    .isLength({ min: 1 })
    .trim()
    .withMessage("User name must be specified."),
  body("password")
    .isLength({ min: 6 })
    .trim()
    .withMessage("Password must be 6 characters or greater."),
  body("qualification")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Qualification is required"),
  body("city").isLength({ min: 1 }).trim().withMessage("City is required"),
  body("phone")
    .isLength({ min: 10 })
    .withMessage("Phone number is required")
    .isMobilePhone("en-IN")
    .withMessage("Only Indian number accepted"),
  // Sanitize fields.
  sanitizeBody("username").escape(),
  sanitizeBody("password").escape(),
  sanitizeBody("qualification").escape(),
  sanitizeBody("city").escape(),
  sanitizeBody("phone").escape(),
  // Process request after validation and sanitization.
  (req, res) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Display sanitized values/errors messages.
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        // Check that user already there or not
        let getUser = constants.find(
          (value) => value.username === req.body.username
        );
        if (getUser && Object.keys(getUser).length) {
          return apiResponse.ErrorResponse(
            res,
            "username is already taken. Please choose different username"
          );
        } else {
          //hash input password
          bcrypt.hash(req.body.password, 10, function (err, hash) {
            const userData = {
              role: "guestuser",
              username: req.body.username,
              qualification: req.body.qualification,
              city: req.body.qualification,
              phone_number: req.body.phone,
            };
            constants.push({ ...userData, password: hash });
            return apiResponse.successResponseWithData(
              res,
              "Registration Success.",
              userData
            );
          });
        }
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
  User login.
 
 @param {string}      email
  @param {string}      password
 
  @returns {Object}
 */
exports.login = [
  body("username")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Username must be specified."),
  body("password")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Password must be specified."),
  sanitizeBody("username").escape(),
  sanitizeBody("password").escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        let getUser = constants.find(
          (value) => value.username === req.body.username
        );
        if (getUser && Object.keys(getUser).length) {
          //Compare given password with db's hash.
          bcrypt.compare(
            req.body.password,
            getUser.password,
            function (err, same) {
              if (same) {
                let userData = {
                  ...getUser,
                  password: "none",
                };
                //Prepare JWT token for authentication
                const jwtPayload = userData;
                const jwtData = {
                  expiresIn: process.env.JWT_TIMEOUT_DURATION,
                };
                const secret = process.env.ACCESS_TOKEN;
                //Generated JWT token with Payload and secret.
                userData.token = jwt.sign(jwtPayload, secret, jwtData);
                return apiResponse.successResponseWithData(
                  res,
                  "Login Success.",
                  userData
                );
              } else {
                return apiResponse.unauthorizedResponse(
                  res,
                  "Email or Password wrong."
                );
              }
            }
          );
        } else {
          return apiResponse.notFoundResponse(res, "User not found");
        }
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
