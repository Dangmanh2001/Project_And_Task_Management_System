"use strict";
const bcrypt = require("bcrypt"); // Import bcrypt (khác với bcryptjs)

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = [];
    for (let i = 0; i < 30; i++) {
      const password = await bcrypt.hash("123456", 10); // Mã hóa mật khẩu
      users.push({
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        password: password,
        role_id: 1, // Giả sử bạn có một role_id mặc định, ví dụ là 1
      });
    }
    await queryInterface.bulkInsert("users", users, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("users", null, {});
  },
};
