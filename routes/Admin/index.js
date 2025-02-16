var express = require("express");
const indexController = require("../../controllers/admin/index.controller");
const manageUserController = require("../../controllers/admin/manage.user.controller");
const manageTaskController = require("../../controllers/admin/manage.task.controller");
const managerProjectController = require("../../controllers/admin/manager.project.controller");
const checkRole = require("../../middleware/checkRole.middleware");
const uploads = require("../../config/multer");
var router = express.Router();

/* GET home page. */
router.get("/", indexController.index);

router.get("/profile", indexController.profile);
router.post(
  "/profile/update-avatar",
  uploads.single("avatarInput"),
  indexController.updateAvatar
);

router.post("/unlink/google", indexController.unlinkGoogle);

router.post("/unlink/facebook", indexController.unlinkFacebook);

router.post("/change-password", indexController.changePass);

router.get("/list-user", manageUserController.listUser);
router.get("/add-user", checkRole([1]), manageUserController.addUser);
router.post("/add-user", checkRole([1]), manageUserController.handleAddU);
router.get("/edit-user/:id", checkRole([1]), manageUserController.editUser);
router.post("/edit-user/:id", checkRole([1]), manageUserController.updateUser);
router.post(
  "/delete-user/:id",
  checkRole([1]),
  manageUserController.deleteUser
);

router.get("/list-project", managerProjectController.listProject);
router.get("/add-project", checkRole([1]), managerProjectController.addProject);
router.post(
  "/add-project",
  checkRole([1]),
  managerProjectController.handleAddProject
);
router.get(
  "/add-user-to-project/:id",
  checkRole([1, 2]),
  managerProjectController.addUtoP
);
router.post(
  "/add-user-to-project/:id",
  checkRole([1, 2]),
  managerProjectController.handleAddUtoP
);
router.get(
  "/remove-user-from-project/:id",
  checkRole([1, 2]),
  managerProjectController.removeUToP
);
router.post(
  "/remove-user-from-project/:id",
  checkRole([1, 1]),
  managerProjectController.handleRemoveUToP
);
router.get(
  "/edit-project/:id",
  checkRole([1, 2]),
  managerProjectController.editProject
);
router.post(
  "/edit-project/:id",
  checkRole([1, 2]),
  managerProjectController.updateProject
);
router.post(
  "/delete-project/:id",
  checkRole([1]),
  managerProjectController.deleteProject
);

router.get("/list-task", manageTaskController.listTask);
router.get("/add-task", checkRole([1]), manageTaskController.addTask);
router.get(
  "/add-user-to-task/:id",
  checkRole([1, 2]),
  manageTaskController.addUToTask
);
router.post(
  "/add-user-to-task/:id",
  checkRole([1, 2]),
  manageTaskController.handleAddUToTask
);
router.get(
  "/remove-user-from-task/:id",
  checkRole([1, 2]),
  manageTaskController.removeUToTask
);
router.post(
  "/remove-user-from-task/:id",
  manageTaskController.handleRemoveUToTask
);
router.post("/add-task", checkRole([1, 2]), manageTaskController.handleAddTask);
router.get("/edit-task/:id", checkRole([1, 2]), manageTaskController.editTask);
router.post(
  "/edit-task/:id",
  checkRole([1, 2]),
  manageTaskController.updateTask
);
router.post(
  "/delete-task/:id",
  checkRole([1, 2]),
  manageTaskController.deleteTask
);

router.get("/charts", indexController.chart);

router.get("/tablesP", indexController.tableP);
router.get("/tablesT", indexController.tableT);

router.get("/settings", indexController.setting);
module.exports = router;
