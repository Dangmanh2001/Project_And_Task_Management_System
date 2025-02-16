"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("user_permissions", {
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // Tên bảng của User
          key: "id", // Khóa chính của bảng User
        },
        onDelete: "CASCADE", // Khi user bị xóa, xóa luôn các bản ghi liên quan trong bảng user_permissions
      },
      permission_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Permissions", // Tên bảng của Permissions
          key: "id", // Khóa chính của bảng Permissions
        },
        onDelete: "CASCADE", // Khi permission bị xóa, xóa luôn các bản ghi liên quan trong bảng user_permissions
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("user_permissions");
  },
};
