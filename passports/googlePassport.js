const GoogleStrategy = require("passport-google-oauth20").Strategy;
const model = require("../models/index");
const { Op } = require("sequelize");
const User = model.User;
const UserSocial = model.UserSocial;

module.exports = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ["profile", "email"],
    passReqToCallback: true,
  },
  async (req, accessToken, refreshToken, profile, cb) => {
    try {
      const { id: googleId, provider } = profile; // provider = 'google'
      const { email } = profile._json;

      // 1) Nếu user chưa đăng nhập, => "đăng nhập" bằng Google
      if (!req.user) {
        // Tìm xem Google ID này có trong DB chưa
        const foundLink = await UserSocial.findOne({
          where: {
            provider: provider,    // 'google'
            providerId: googleId, // Google ID
          },
        });

        if (!foundLink) {
          // Chưa liên kết => Tuỳ ý: tạo user mới / báo lỗi / ...
          return cb(null, false, { message: "Tài khoản Google này chưa được liên kết!" });
        }

        // Đã liên kết => lấy user
        const user = await User.findByPk(foundLink.userId);
        if (!user) {
          return cb(null, false, { message: "Không tìm thấy user tương ứng!" });
        }

        // Đăng nhập thành công
        return cb(null, user);
      }

      // 2) Nếu user đã đăng nhập => đang muốn liên kết Google
      // Kiểm tra xem user này đã liên kết Google chưa
      const existingLinkForThisUser = await UserSocial.findOne({
        where: {
          userId: req.user.id,
          provider: provider, // google
        },
      });

      if (existingLinkForThisUser) {
        req.session.verify = "done"
        return cb(null, false, { message: "Bạn đã liên kết Google trước đó!" });
      }

      // Kiểm tra xem Google ID này có gắn với user khác chưa
      const foundLinkWithAnotherUser = await UserSocial.findOne({
        where: {
          provider: provider, 
          providerId: googleId,
        },
      });

      if (foundLinkWithAnotherUser) {
        // Tài khoản Google này đã liên kết với user khác
        return cb(null, false, { message: "Tài khoản Google này đã được liên kết cho user khác!" });
      }

      // Nếu qua hết các bước kiểm tra => Tạo mới
      await UserSocial.create({
        userId: req.user.id,
        provider,
        providerId: googleId,
      });
      req.session.verify = "done"
      return cb(null, req.user);
    } catch (error) {
      console.error("Lỗi GoogleStrategy:", error);
      return cb(error);
    }
  }
);
