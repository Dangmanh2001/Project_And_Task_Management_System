require("dotenv").config(); // Đọc các biến môi trường từ tệp .env

module.exports = {
  development: {
    username: process.env.DB_USERNAME, // Lấy từ .env
    password: process.env.DB_PASSWORD, // Lấy từ .env
    database: process.env.DB_DATABASE, // Lấy từ .env
    host: process.env.DB_HOST, // Lấy từ .env
    dialect: process.env.DB_DIALECT, // Lấy từ .env
    logging: false, // Tắt logging SQL (nếu không cần)
  },
  test: {
    username: process.env.DB_USERNAME, // Lấy từ .env
    password: process.env.DB_PASSWORD, // Lấy từ .env
    database: process.env.DB_DATABASE + "_test", // Sử dụng cơ sở dữ liệu test
    host: process.env.DB_HOST, // Lấy từ .env
    dialect: process.env.DB_DIALECT, // Lấy từ .env
    logging: false, // Tắt logging SQL (nếu không cần)
  },
  production: {
    username: process.env.DB_USERNAME, // Lấy từ .env
    password: process.env.DB_PASSWORD, // Lấy từ .env
    database: process.env.DB_DATABASE + "_prod", // Sử dụng cơ sở dữ liệu production
    host: process.env.DB_HOST, // Lấy từ .env
    dialect: process.env.DB_DIALECT, // Lấy từ .env
    logging: false, // Tắt logging SQL (nếu không cần)
  },
};
