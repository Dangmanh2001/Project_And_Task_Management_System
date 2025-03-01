var express = require("express");
const indexController = require("../../controllers/admin/index.controller");
const manageUserController = require("../../controllers/admin/manage.user.controller");
const manageTaskController = require("../../controllers/admin/manage.task.controller");
const managerProjectController = require("../../controllers/admin/manager.project.controller");
const checkPermission = require("../../middleware/checkPermission.middleware");
const uploads = require("../../config/multer");
const managerPermissionController = require("../../controllers/admin/manager.permission.controller");
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
router.get("/activity", indexController.activity);

router.post("/activity/delete", indexController.deleteActivityAll);
router.post("/activity/:id/delete", indexController.deleteActivityId);

router.get("/assign-role/:id", indexController.assignRole);
router.post("/assign-role/:id", indexController.handleAssignRole);

router.get(
  "/list-user",
  checkPermission("user_view"),
  manageUserController.listUser
);
router.get(
  "/add-user",
  checkPermission("user_create"),
  manageUserController.addUser
);
router.post(
  "/add-user",
  checkPermission("user_create"),
  manageUserController.handleAddU
);
router.get(
  "/edit-user/:id",
  checkPermission("user_edit"),
  manageUserController.editUser
);
router.post(
  "/edit-user/:id",
  checkPermission("user_edit"),
  manageUserController.updateUser
);
router.post(
  "/delete-user/:id",
  checkPermission("user_delete"),
  manageUserController.deleteUser
);

router.get(
  "/list-project",
  checkPermission("project_view"),
  managerProjectController.listProject
);
router.get(
  "/add-project",
  checkPermission("project_create"),
  managerProjectController.addProject
);
router.post(
  "/add-project",
  checkPermission("project_create"),
  managerProjectController.handleAddProject
);
router.get(
  "/add-user-to-project/:id",
  checkPermission("project_edit"),
  managerProjectController.addUtoP
);
router.post(
  "/add-user-to-project/:id",
  checkPermission("project_edit"),
  managerProjectController.handleAddUtoP
);
router.get(
  "/remove-user-from-project/:id",
  checkPermission("project_edit"),
  managerProjectController.removeUToP
);
router.post(
  "/remove-user-from-project/:id",
  checkPermission("project_edit"),
  managerProjectController.handleRemoveUToP
);
router.get(
  "/edit-project/:id",
  checkPermission("project_edit"),
  managerProjectController.editProject
);
router.post(
  "/edit-project/:id",
  checkPermission("project_edit"),
  managerProjectController.updateProject
);
router.post(
  "/delete-project/:id",
  checkPermission("project_delete"),
  managerProjectController.deleteProject
);

router.get(
  "/list-task",
  checkPermission("task_view"),
  manageTaskController.listTask
);
router.get(
  "/add-task",
  checkPermission("task_create"),
  manageTaskController.addTask
);
router.post(
  "/add-task",
  checkPermission("task_create"),
  manageTaskController.handleAddTask
);

router.get(
  "/add-user-to-task/:id",
  checkPermission("task_edit"),
  manageTaskController.addUToTask
);
router.post(
  "/add-user-to-task/:id",
  checkPermission("task_edit"),
  manageTaskController.handleAddUToTask
);
router.get(
  "/remove-user-from-task/:id",
  checkPermission("task_edit"),
  manageTaskController.removeUToTask
);
router.post(
  "/remove-user-from-task/:id",
  checkPermission("task_edit"),
  manageTaskController.handleRemoveUToTask
);
router.get(
  "/edit-task/:id",
  checkPermission("task_edit"),
  manageTaskController.editTask
);
router.post(
  "/edit-task/:id",
  checkPermission("task_edit"),
  manageTaskController.updateTask
);
router.post(
  "/delete-task/:id",
  checkPermission("task_delete"),
  manageTaskController.deleteTask
);

router.get("/charts", indexController.chart);

router.get("/tablesP", indexController.tableP);
router.get("/tablesT", indexController.tableT);

router.get(
  "/list-roles",
  checkPermission("role_view"),
  managerPermissionController.listRole
);
router.get(
  "/add-role",
  checkPermission("user_view"),
  managerPermissionController.addRole
);
router.post(
  "/add-role",
  checkPermission("role_create"),
  managerPermissionController.handleAddRole
);
router.get(
  "/role/:id/edit",
  checkPermission("role_edit"),
  managerPermissionController.editRole
);
router.post(
  "/role/:id/edit",
  checkPermission("role_edit"),
  managerPermissionController.handleEditRole
);
router.post(
  "/role/:id/delete",
  checkPermission("role_delete"),
  managerPermissionController.deleteRole
);

module.exports = router;
