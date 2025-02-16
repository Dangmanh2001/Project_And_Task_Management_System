const { Task } = require("../models");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tasks = [];

    for (let i = 1; i <= 19; i++) {
      tasks.push({
        name: `Task ${i}`,
        description: `Mô tả chi tiết cho task ${i}`,
        project_id: Math.floor(Math.random() * 20) + 1,
        assignee: 1, // Giả sử có 10 người dùng, chọn ngẫu nhiên
        status: [
          "Đang thực hiện",
          "Hoàn thành",
          "Chưa bắt đầu",
          "Ngưng hoạt động",
        ][Math.floor(Math.random() * 4)], // Trạng thái ngẫu nhiên
        due_date: `2025-02-${(i % 28) + 1}`, // Ngày hết hạn ngẫu nhiên trong tháng 2 năm 2025
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Thêm dữ liệu vào bảng
    await queryInterface.bulkInsert("tasks", tasks, {});
  },

  down: async (queryInterface, Sequelize) => {
    // Xoá tất cả các bản ghi trong bảng tasks nếu cần rollback
    await queryInterface.bulkDelete("tasks", null, {});
  },
};
