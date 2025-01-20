var express = require("express");
const indexController = require("../../controllers/index.controller");
var router = express.Router();

/* GET home page. */
router.get("/", indexController.index);

router.get("/profile", indexController.profile);

router.get("/list-user",indexController.listUser)

router.get("/add-user",indexController.addUser)

router.get("/edit-user",indexController.editUser)

router.get("/delete-user",indexController.deleteUser)

module.exports = router;
