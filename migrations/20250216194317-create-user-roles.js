module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("UserRoles", {
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // Tên bảng Users mà cột user_id tham chiếu đến
          key: "id",
        },
        onDelete: "CASCADE", // Nếu User bị xóa, các bản ghi trong UserRoles sẽ bị xóa
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Roles", // Tên bảng Roles mà cột role_id tham chiếu đến
          key: "id",
        },
        onDelete: "CASCADE", // Nếu Role bị xóa, các bản ghi trong UserRoles sẽ bị xóa
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("UserRoles");
  },
};
