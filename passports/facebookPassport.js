const FacebookStrategy = require("passport-facebook");
const model = require("../models/index");

const User = model.User;
const User_social = model.UserSocial;
const { Op } = require("sequelize");

module.exports = new FacebookStrategy(
  {
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    state: true,
    profileFields: ["id", "emails", "name"],
    scope: ["email"],
    passReqToCallback: true,
  },
  async (req, accessToken, refreshToken, profile, cb) => {
    const { _json, provider, id } = profile;
    const { email } = _json;
    if (!req.user) {
      const providerLogin = await User_social.findOne({
        where: {
          [Op.and]: [{ provider: provider }, { providerId: id }],
        },
      });
      if (!providerLogin) {
        return cb(null, false, { message: "Tài khoản chưa được liên kết" });
      }
      const user = await User.findOne({
        where: {
          id: providerLogin.userId,
        },
      });

      // Lưu giá trị vào session
      req.session.verify = "done";

      return cb(null, user);
    }

    const providerLink = await User_social.findOne({
      where: {
        [Op.and]: [{ providerId: id }, { provider: provider }],
      },
    });

    if (!providerLink) {
      await User_social.create({
        userId: req.user.id,
        provider,
        providerId: id,
      });

      // Lưu giá trị vào session
      req.session.verify = "done";

      return cb(null, req.user);
    }

    return cb(null, false, {
      message: "Tài khoản này đã được liên kết",
    });
  }
);
