var express = require("express");
const indexController = require("../../controllers/admin/index.controller");
const manageUserController = require("../../controllers/admin/manage.user.controller");
const manageTaskController = require("../../controllers/admin/manage.task.controller");
var router = express.Router();

/* GET home page. */
router.get("/", indexController.index);

router.get("/profile", indexController.profile);

router.post("/unlink/google",indexController.unlinkGoogle)

router.post("/unlink/facebook",indexController.unlinkFacebook)

router.post("/change-password",indexController.changePass)

router.get("/list-user",manageUserController.listUser)

router.get("/add-user",manageUserController.addUser)

router.get("/edit-user",manageUserController.editUser)

router.get("/delete-user",manageUserController.deleteUser)

router.get("/list-task",manageTaskController.listTask)

router.get("/add-task",manageTaskController.addTask)

router.get("/edit-task",manageTaskController.editTask)

router.get("/delete-task",manageTaskController.deleteTask)

router.get("/charts",indexController.chart)

router.get("/tables",indexController.table)

router.get("/settings",indexController.setting)
module.exports = router;
