var express = require("express");
const indexController = require("../../controllers/admin/index.controller");
const manageUserController = require("../../controllers/admin/manage.user.controller");
const manageTaskController = require("../../controllers/admin/manage.task.controller");
const managerProjectController = require("../../controllers/admin/manager.project.controller");
var router = express.Router();

/* GET home page. */
router.get("/", indexController.index);

router.get("/profile", indexController.profile);

router.post("/unlink/google", indexController.unlinkGoogle);

router.post("/unlink/facebook", indexController.unlinkFacebook);

router.post("/change-password", indexController.changePass);

router.get("/list-user", manageUserController.listUser);
router.get("/add-user", manageUserController.addUser);
router.post("/add-user", manageUserController.handleAddU);
router.get("/edit-user/:id", manageUserController.editUser);
router.post("/edit-user/:id", manageUserController.updateUser);
router.post("/delete-user/:id", manageUserController.deleteUser);

router.get("/list-project", managerProjectController.listProject);
router.get("/add-project", managerProjectController.addProject);
router.post("/add-project", managerProjectController.handleAddProject);
router.get("/edit-project/:id", managerProjectController.editProject);
router.post("/edit-project/:id", managerProjectController.updateProject);
router.post("/delete-project/:id", managerProjectController.deleteProject);

router.get("/list-task", manageTaskController.listTask);

router.get("/add-task", manageTaskController.addTask);

router.get("/edit-task/:id", manageTaskController.editTask);

router.get("/delete-task/:id", manageTaskController.deleteTask);

router.get("/charts", indexController.chart);

router.get("/tables", indexController.table);

router.get("/settings", indexController.setting);
module.exports = router;
