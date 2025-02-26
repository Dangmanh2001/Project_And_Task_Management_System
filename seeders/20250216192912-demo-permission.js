module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("permissions", [
      {
        name: "user_view", // Quyền "Xem" dành cho User
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "user_create", // Quyền "Thêm" dành cho User
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "user_edit", // Quyền "Sửa" dành cho User
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "user_delete", // Quyền "Xóa" dành cho User
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "project_view", // Quyền "Xem" dành cho Project
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "project_create", // Quyền "Thêm" dành cho Project
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "project_edit", // Quyền "Sửa" dành cho Project
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "project_delete", // Quyền "Xóa" dành cho Project
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "task_view", // Quyền "Xem" dành cho Task
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "task_create", // Quyền "Thêm" dành cho Task
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "task_edit", // Quyền "Sửa" dành cho Task
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "task_delete", // Quyền "Xóa" dành cho Task
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "role_view", // Quyền "Xem" dành cho Role
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "role_create", // Quyền "Thêm" dành cho Role
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "role_edit", // Quyền "Sửa" dành cho Role
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "role_delete", // Quyền "Xóa" dành cho Role
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Xóa tất cả các bản ghi trong bảng permissions
    await queryInterface.bulkDelete("permissions", null, {});
  },
};
