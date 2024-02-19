// src/routes/uploadRouter.js
const express = require("express");
const Router = require("express");
const multer = require("multer");
const router = new Router();
const controller = require('../controllers/s3Controller');

const upload = multer();

router.post("/", upload.single("image"), controller.uploadFile);
router.delete("/:key", controller.deleteFile);

module.exports = router;
