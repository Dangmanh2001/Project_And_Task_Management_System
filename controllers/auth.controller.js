const model = require("../models/index");
const user = model.User;
module.exports = {
  login: async (req, res) => {
    const error = req.flash("error");
    res.render("login", {
      title: "Login",
      layout: "layouts/auth.layout.ejs",
      error,
    });
  },

  register: (req, res) => {
    res.render("register", {
      title: "Register",
      layout: "layouts/auth.layout.ejs",
    });
  },
  forgotPass: (req, res) => {
    res.render("forgot_password", {
      title: "ForgotPassword",
      layout: "layouts/auth.layout.ejs",
    });
  },
  logout: (req, res) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      // Chuyển hướng về trang login sau khi đăng xuất
      res.redirect("/auth/login");
    });
  },
};
