const express = require("express");
const router = express.Router();

router.get("/", function (req, res, next) {
  res.render("error", { title: "Not found" });
});

module.exports = router;
