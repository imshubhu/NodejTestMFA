const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/authenticate");
const { constants, postImage } = require("../helpers/constant");

/**
 * User Homepage.
 *
 * @returns {Object}
 */
exports.userHomepage = [
  auth,
  function (req, res) {
    try {
      let getUser = constants.find(
        (value) => value.username === req.user.username
      );

      if (getUser && Object.keys(getUser).length) {
        return apiResponse.successResponseWithData(res, "User Detail", {
          ...getUser,
          images: [...postImage],
        });
      } else {
        return apiResponse.successResponseWithData(
          res,
          "User Detail not found",
          []
        );
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * Post Image.
 *
 * @returns {Object}
 */
exports.postImage = [
  auth,
  function (req, res) {
    try {
      if (req.files && req.files.length) {
        postImage.push(...req.files);
        let postObj = [...req.files];
        return apiResponse.successResponseWithData(
          res,
          "Post Image Uploaded Successfully",
          postObj
        );
      } else {
        return apiResponse.successResponseWithData(
          res,
          "Error throw at the time of upload image",
          []
        );
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
