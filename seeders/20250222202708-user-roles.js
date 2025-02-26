"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "UserRoles",
      [
        {
          user_id: 1, // id của role
          role_id: 1, // id của permission
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Thêm nhiều dữ liệu nếu cần
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("UserRoles", null, {});
  },
};
