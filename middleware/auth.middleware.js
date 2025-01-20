// middleware/authMiddleware.js

module.exports = {
  isAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      // Nếu đã đăng nhập, chuyển hướng về trang chủ hoặc trang khác
      return res.redirect("/");
    }
    // Nếu chưa đăng nhập, tiếp tục với các route login và register
    return next();
  },

  isLoggedIn: (req, res, next) => {
    if (!req.isAuthenticated()) {
      // Nếu chưa đăng nhập, chuyển hướng tới login
      return res.redirect("/auth/login");
    }
    return next(); // Nếu đã đăng nhập, tiếp tục với các route khác
  },
};
