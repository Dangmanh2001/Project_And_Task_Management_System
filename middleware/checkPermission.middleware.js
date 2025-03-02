const model = require("../models/index");
const User = model.User;
const Role = model.Role;
const Permission = model.Permission;

// Middleware để kiểm tra quyền
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    const userId = req.user.id;
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
    // Kiểm tra nếu user có quyền yêu cầu
    if (userPermissions.includes(requiredPermission)) {
      return next(); // Nếu có quyền, tiếp tục xử lý route tiếp theo
    } else {
      req.flash("error", "Bạn không có quyền thực hiện thao tác này!");
      return res.redirect("/"); // Nếu không có quyền, redirect về trang chủ
    }
  };
};

module.exports = checkPermission;
