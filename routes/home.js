require("dotenv").config();
var express = require("express");
const multer = require("multer");
const HomeController = require("../controllers/homeController");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { randomNumber } = require("../helpers/utility");

var router = express.Router();

// Insitalize diskStorage
var postStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const postuploadDir = path.join(__dirname, "..", "public");
    if (fs.existsSync(postuploadDir)) {
      cb(null, postuploadDir);
    } else {
      fs.mkdirSync(postuploadDir, { recursive: true });
      cb(null, postuploadDir);
    }
  },

  filename: async function (req, file, cb) {
    const decoded = await jwt.verify(
      req.headers["authorization"].split(" ")[1],
      process.env.ACCESS_TOKEN
    );
    const randomNo = randomNumber(10);
    if (decoded.role === "admin") {
      cb(null, randomNo + "_" + Date.now() + "_" + file.originalname);
    } else {
      cb("Only Admin can upload images");
    }
  },
});

// Uploading image on public folder using multer
const uploadPostImg = multer({
  storage: postStorage,
  fileFilter: function (req, file, cb) {
    const fileType = /jpeg|jpg|png|gif/;
    const extension = file.originalname.substring(
      file.originalname.lastIndexOf(".") + 1
    );
    const mimetype = fileType.test(file.mimetype);

    if (mimetype && extension) {
      return cb(null, true);
    } else {
      cb("Error:you can upload only Image");
    }
  },
});

router.get("/homepage", HomeController.userHomepage);
router.post(
  "/postImage",
  uploadPostImg.array("image", 12),
  HomeController.postImage
);

module.exports = router;
