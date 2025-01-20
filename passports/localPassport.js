const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const model = require("../models/index");
const users = model.User;

module.exports = new LocalStrategy(
  {
    usernameField: "email", // Trường email làm tên người dùng
    passwordField: "password", // Trường mật khẩu
    passReqToCallback: true, // Cho phép truyền req vào callback
  },
  async function (req, email, password, done) {
    // Tìm kiếm người dùng trong cơ sở dữ liệu
    const user = await users.findOne({
      where: {
        email,
      },
    });

    // Kiểm tra nếu không tìm thấy người dùng
    if (!user) {
      return done(null, false, {
        message: "Thông tin đăng nhập không chính xác",
      });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);

    // Nếu mật khẩu sai
    if (!isMatch) {
      return done(null, false, {
        message: "Thông tin đăng nhập không chính xác",
      });
    }

    // Lưu thông tin người dùng vào session
    req.session.user = {
      id: user.id, // Sử dụng `user.id` thay vì `user._id`
      name: user.name,
      email: user.email,
      role: user.role_id,
    };

    // Gọi `done()` để xác nhận người dùng đã đăng nhập thành công
    return done(null, user);
  }
);
