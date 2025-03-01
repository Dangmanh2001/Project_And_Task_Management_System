const model = require("../models/index");
const Task = model.Task;
const Project = model.Project;
const { Op } = require("sequelize");

// Hàm kiểm tra và cập nhật các task hết hạn
const updateExpiredTasksAndProjects = async () => {
  try {
    // Kiểm tra các task đã hết hạn và không có trạng thái 'expired' hoặc 'completed'
    const expiredTasks = await Task.findAll({
      where: {
        due_date: { [Op.lt]: new Date() }, // So sánh deadline nhỏ hơn thời gian hiện tại
        status: { [Op.notIn]: ["Đã hết hạn", "Hoàn thành"] }, // Loại bỏ những task có trạng thái 'Đã hết hạn' hoặc 'Hoàn thành'
      },
    });

    // Cập nhật trạng thái cho các task đã hết hạn
    for (const task of expiredTasks) {
      await task.update({ status: "Đã hết hạn" });
      console.log(`Task ID ${task.id} đã được cập nhật thành "Đã hết hạn"`);
    }

    // Kiểm tra các project đã hết hạn và không có trạng thái 'expired' hoặc 'Hoàn thành'
    const expiredProjects = await Project.findAll({
      where: {
        end_date: { [Op.lt]: new Date() }, // So sánh deadline nhỏ hơn thời gian hiện tại
        status: { [Op.notIn]: ["Đã hết hạn", "Hoàn thành"] }, // Loại bỏ những project có trạng thái 'Đã hết hạn' hoặc 'Hoàn thành'
      },
    });

    // Cập nhật trạng thái cho các project đã hết hạn
    for (const project of expiredProjects) {
      await project.update({ status: "Đã hết hạn" });
      console.log(
        `Project ID ${project.id} đã được cập nhật thành "Đã hết hạn"`
      );
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật task/project hết hạn:", error.message);
  }
};

// Chạy hàm updateExpiredTasksAndProjects mỗi 10 giây
const startUpdateExpiredJobs = () => {
  setInterval(updateExpiredTasksAndProjects, 10000); // Mỗi 10 giây (10000ms)
};

module.exports = { startUpdateExpiredJobs };
