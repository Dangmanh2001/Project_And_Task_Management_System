const multer = require("multer");
const path = require("path");

// Cấu hình multer để lưu ảnh vào thư mục "uploads"
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/"); // Lưu ảnh vào thư mục public/uploads
  },
  filename: (req, file, cb) => {
    const name = req.user.dataValues.name;

    cb(null, name + "-" + file.originalname); // Đặt tên cho ảnh
  },
});

// Tạo middleware multer để xử lý ảnh
const upload = multer({ storage: storage });
module.exports = upload;
