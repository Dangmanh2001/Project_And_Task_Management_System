const express = require("express");
const errorController = require("../controllers/admin/error.controller");
const router = express.Router();

router.get("/", errorController.error);

module.exports = router;
