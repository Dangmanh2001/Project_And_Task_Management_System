const GoogleStrategy = require("passport-google-oauth20").Strategy;
const model = require("../models/index");

const User = model.User;
const User_social = model.UserSocial;
const { Op } = require("sequelize");

module.exports = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID, // Lấy từ Google Developer Console
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Lấy từ Google Developer Console
    callbackURL: process.env.GOOGLE_CALLBACK_URL, // Địa chỉ callback mà Google sẽ gọi lại
    scope: ["profile", "email"],
    passReqToCallback: true,
  },
  async (req, accessToken, refreshToken, profile, cb) => {
    const { id, provider } = profile;
    const { email } = profile._json; // Lấy email từ thông tin trả về của Google

    if (!req.user) {
      // Kiểm tra xem tài khoản Google đã liên kết với người dùng chưa
      const providerLogin = await User_social.findOne({
        where: {
          [Op.and]: [{ provider: provider }, { providerId: id }],
        },
      });

      if (!providerLogin) {
        return cb(null, false, { message: "Tài khoản chưa được liên kết" });
      }

      // Nếu tài khoản đã được liên kết, tìm người dùng
      const user = await User.findOne({
        where: {
          id: providerLogin.userId,
        },
      });

      // Lưu giá trị vào session
      req.session.verify = "done";

      return cb(null, user);
    }

    // Kiểm tra xem tài khoản đã được liên kết chưa
    const providerLink = await User_social.findOne({
      where: {
        [Op.and]: [{ providerId: id }, { provider: provider }],
      },
    });

    if (!providerLink) {
      // Nếu chưa liên kết, thực hiện liên kết tài khoản Google với người dùng hiện tại
      await User_social.create({
        userId: req.user.id,
        provider,
        providerId: id,
      });

      // Lưu giá trị vào session
      req.session.verify = "done";

      return cb(null, req.user);
    }

    // Nếu tài khoản đã liên kết, trả về thông báo
    return cb(null, false, {
      message: "Tài khoản này đã được liên kết",
    });
  }
);
