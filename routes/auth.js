var express = require("express");
const authController = require("../controllers/auth.controller");
var router = express.Router();
const passport = require("passport");
const authMiddleware = require("../middleware/auth.middleware");

/* GET users listing. */
router.get("/login", authMiddleware.isAuthenticated, authController.login);

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/", // Chuyển hướng sau khi đăng nhập thành công
    failureRedirect: "/auth/login", // Chuyển hướng nếu thất bại
    failureFlash: true, // Hiển thị thông báo lỗi nếu đăng nhập thất bại
  })
);
router.get("/facebook/redirect", passport.authenticate("facebook"));
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/auth/login",
    failureFlash: true,
    successRedirect: "/",
  })
);

router.get("/google/redirect", passport.authenticate("google"));
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/login",
    failureFlash: true,
    successRedirect: "/",
  })
);

router.get(
  "/forgotPass",
  authMiddleware.isAuthenticated,
  authController.forgotPass
);
router.post(
  "/forgotPass",
  authMiddleware.isAuthenticated,
  authController.handleForgotPass
);
router.get("/logout", authController.logout); // Route để xử lý logout

module.exports = router;
