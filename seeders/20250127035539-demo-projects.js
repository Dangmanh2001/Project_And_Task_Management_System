"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    // Tạo 20 dự án với created_by = 1
    return queryInterface.bulkInsert(
      "projects",
      Array.from({ length: 20 }).map((_, index) => ({
        name: `Dự án ${index + 1}`,
        description: `Mô tả chi tiết cho dự án ${index + 1}`,
        start_date: new Date(),
        end_date: new Date(new Date().setDate(new Date().getDate() + 30)), // Thêm 30 ngày
        status: "Đang thực hiện", // Trạng thái mặc định
        created_by: 10, // Gán người tạo dự án là user có id = 1
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
  },

  async down(queryInterface, Sequelize) {
    // Xóa các dữ liệu đã tạo trong quá trình seeding
    return queryInterface.bulkDelete("projects", null, {});
  },
};
