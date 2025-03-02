const model = require("../models/index");
const User = model.User;
const Role = model.Role;
const Permission = model.Permission;

// Middleware để kiểm tra quyền
const checkPermissionGenerate = (requiredPermissions) => {
  return async (req, res, next) => {
    const userId = req.user.id;

    try {
      // Lấy thông tin user và các role của user
      const user = await User.findOne({
        where: { id: userId },
        include: {
          model: Role,
          include: {
            model: Permission,
            through: { attributes: [] }, // Không lấy dữ liệu từ bảng trung gian, chỉ lấy quyền
          },
        },
      });

      // Lấy tất cả các quyền mà user có
      const userPermissions = user.Roles.flatMap((role) =>
        role.Permissions.map((permission) => permission.name)
      );

      // Kiểm tra nếu user có ít nhất một quyền trong mảng requiredPermissions
      const hasPermission = requiredPermissions.some((permission) =>
        userPermissions.includes(permission)
      );

      if (hasPermission) {
        return next(); // Nếu có quyền, tiếp tục xử lý route tiếp theo
      } else {
        req.flash("error", "Bạn không có quyền thực hiện thao tác này!");
        return res.redirect("/"); // Nếu không có quyền, redirect về trang chủ
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra quyền:", error.message);
      res.status(500).send("Có lỗi xảy ra khi kiểm tra quyền.");
    }
  };
};

module.exports = checkPermissionGenerate;
