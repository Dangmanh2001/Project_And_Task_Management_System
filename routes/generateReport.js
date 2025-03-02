const express = require("express");
const generateReportController = require("../controllers/generateReport.controller");
const checkPermissionGenerate = require("../middleware/checkPermission.generate.middleware");
const router = express.Router();

// Route xử lý generate report - Sử dụng POST
router.post("/role", generateReportController.role);
router.post("/user", generateReportController.user);
router.post(
  "/project",
  checkPermissionGenerate([
    "project_view",
    "project_create",
    "project_edit",
    "project_delete",
  ]),
  generateReportController.project
);
router.post(
  "/task",
  checkPermissionGenerate([
    "task_view",
    "task_create",
    "task_edit",
    "task_delete",
  ]),
  generateReportController.task
);

module.exports = router;
