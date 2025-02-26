const model = require("../models/index");
const sendMail = require("../utils/sendMail");
const bcrypt = require("bcrypt");

// Số lần "salt" (số vòng băm) — giá trị càng cao thì độ bảo mật càng cao, nhưng sẽ tốn thời gian hơn
const saltRounds = 10;

// Mã hóa mật khẩu

const User = model.User;
module.exports = {
  login: async (req, res) => {
    const error = req.flash("error");
    res.render("login", {
      title: "Login",
      layout: "layouts/auth.layout.ejs",
      error,
    });
  },

  forgotPass: (req, res) => {
    const err = req.flash("error");
    const success = req.flash("success");
    res.render("forgot_password", {
      title: "ForgotPassword",
      err,
      success,
      layout: "layouts/auth.layout.ejs",
    });
  },
  handleForgotPass: async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      req.flash("error", "Không tìm thấy email!");
      return res.redirect("/auth/forgotPass");
    }
    req.flash("success", "Vui lòng kiểm tra email của bạn!");
    function generateRandomString(length = 8) {
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let result = "";

      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
      }

      return result;
    }
    const newPass = generateRandomString();
    console.log(newPass); // Ví dụ: "aB4d9G7h"

    bcrypt.hash(newPass, saltRounds, async (err, hashedPassword) => {
      if (err) {
        console.error("Error hashing password:", err);
      } else {
        await User.update(
          { password: hashedPassword },
          {
            where: {
              email,
            },
          }
        );
      }
    });
    sendMail(
      email,
      "Quên mật khẩu",
      "",
      `<!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quên Mật Khẩu</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 0;
          }
          .email-container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 20px;
          }
          .email-header {
            background-color: #f8d7da;
            color: #721c24;
            padding: 15px;
            text-align: center;
            border-radius: 8px;
            font-size: 20px;
            font-weight: bold;
          }
          .email-content {
            margin-top: 20px;
            font-size: 16px;
            color: #333333;
            line-height: 1.5;
          }
          .important-message {
            background-color: #fff3cd;
            color: #856404;
            padding: 15px;
            margin-top: 20px;
            border-left: 5px solid #ffecb5;
            font-size: 16px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 14px;
            color: #777777;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <!-- Header Section -->
          <div class="email-header">
            Quên Mật Khẩu
          </div>
      
          <!-- Email Content -->
          <div class="email-content">
            <p>Chào bạn,</p>
            <p>Mật khẩu mới của bạn là <strong>${newPass}</strong>. Vui lòng sử dụng mật khẩu này để đăng nhập vào tài khoản của bạn.</p>
            
            <!-- Important Message -->
            <div class="important-message">
              <p><strong>Vui lòng đổi mật khẩu sau khi bạn nhận được mật khẩu mới.</strong></p>
            </div>
          </div>
      
          <!-- Footer -->
          <div class="footer">
            <p>Đây là một email tự động. Vui lòng không trả lời email này.</p>
          </div>
        </div>
      </body>
      </html>
      `
    );
    res.redirect("/auth/forgotPass");
  },
  logout: (req, res) => {
    delete req.session.status;
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      // Chuyển hướng về trang login sau khi đăng xuất
      res.redirect("/auth/login");
    });
  },
};
