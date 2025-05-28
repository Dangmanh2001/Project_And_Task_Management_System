"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Tạo một mảng các permission_id từ 1 đến 12 cho role_id = 1
    const permissions = Array.from({ length: 18 }, (_, index) => ({
      role_id: 1, // id của role
      permission_id: index + 1, // permission_id từ 1 đến 12
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Thêm các bản ghi vào bảng RolePermissions (bảng trung gian)
    await queryInterface.bulkInsert("RolePermissions", permissions, {});
  },

  down: async (queryInterface, Sequelize) => {
    // Xóa tất cả bản ghi trong bảng RolePermissions
    await queryInterface.bulkDelete("RolePermissions", null, {});
  },
};
