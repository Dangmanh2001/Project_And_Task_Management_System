const FacebookStrategy = require("passport-facebook");
const model = require("../models/index");
const { Op } = require("sequelize");

const User = model.User;
const UserSocial = model.UserSocial;

module.exports = new FacebookStrategy(
  {
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    state: true, // bật chế độ bảo mật state
    profileFields: ["id", "emails", "name"], // Lấy thêm email, name
    scope: ["email"],
    passReqToCallback: true,
  },
  async (req, accessToken, refreshToken, profile, cb) => {
    try {
      // Giải nén thông tin từ profile Facebook
      const { _json, provider, id } = profile; // provider = "facebook"
      const { email } = _json; // email (nếu người dùng cấp quyền)

      // 1) Người dùng chưa đăng nhập => dùng Facebook để đăng nhập
      if (!req.user) {
        // Tìm xem Facebook này đã liên kết UserSocial chưa
        const foundLink = await UserSocial.findOne({
          where: {
            provider: provider, // 'facebook'
            providerId: id, // Facebook ID
          },
        });

        // Nếu chưa có => tùy ý: tạo user mới, hoặc báo "Chưa liên kết" (tùy logic dự án)
        if (!foundLink) {
          return cb(null, false, {
            message: "Tài khoản Facebook này chưa được liên kết!",
          });
        }

        // Nếu đã có => truy vấn user tương ứng
        const user = await User.findByPk(foundLink.userId);
        if (!user) {
          return cb(null, false, { message: "Không tìm thấy user tương ứng!" });
        }

        // Đăng nhập thành công
        return cb(null, user);
      }

      // 2) Người dùng đã đăng nhập => muốn LIÊN KẾT tài khoản Facebook này
      // Kiểm tra user hiện tại đã có Facebook link chưa
      const existingLinkForThisUser = await UserSocial.findOne({
        where: {
          userId: req.user.id,
          provider: provider, // 'facebook'
        },
      });
      if (existingLinkForThisUser) {
        // User này đã liên kết Facebook 1 lần
        req.session.verify = "done";
        return cb(null, false, {
          message: "Bạn đã liên kết Facebook trước đó!",
        });
      }

      // Kiểm tra xem Facebook ID này có gắn với user khác chưa
      const foundLinkWithAnotherUser = await UserSocial.findOne({
        where: {
          provider: provider,
          providerId: id,
        },
      });
      if (foundLinkWithAnotherUser) {
        // Tài khoản Facebook này đã được liên kết cho user khác
        return cb(null, false, {
          message: "Tài khoản Facebook này đã được liên kết cho user khác!",
        });
      }

      // Nếu qua hết các bước => Tạo mới liên kết
      await UserSocial.create({
        userId: req.user.id,
        provider,
        providerId: id,
      });

      // Đặt cờ verify vào session (nếu bạn muốn)
      req.session.verify = "done";

      // Hoàn tất liên kết => trả về user
      return cb(null, req.user);
    } catch (error) {
      console.error("Lỗi FacebookStrategy:", error);
      return cb(error);
    }
  }
);
