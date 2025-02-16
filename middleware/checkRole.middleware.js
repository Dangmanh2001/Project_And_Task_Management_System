// middlewares/checkRole.js

const checkRole = (roles) => {
  return (req, res, next) => {
    // Kiểm tra xem vai trò của người dùng có nằm trong danh sách các vai trò cho phép không
    if (!roles.includes(req.user.role_id)) {
      return res.redirect("/"); // Nếu vai trò không hợp lệ, chuyển hướng về trang chủ
    }

    // Nếu vai trò hợp lệ, cho phép người dùng tiếp tục
    next();
  };
};

module.exports = checkRole;
