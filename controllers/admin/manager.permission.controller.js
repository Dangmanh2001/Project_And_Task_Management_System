const model = require("../../models/index");
const User = model.User;
const UserSocial = model.UserSocial;
const Role = model.Role;
const Project = model.Project;
const Task = model.Task;
const Permission = model.Permission;
const ActivityLog = model.ActivityLog;
const { Op } = require("sequelize");

module.exports = {
  listRole: async (req, res) => {
    const success = req.flash("success", "");
    const error = req.flash("error", "");
    const page = parseInt(req.query.page) || 1; // Lấy số trang từ query params, mặc định là 1
    const pageSize = 10; // Số lượng vai trò mỗi trang
    const offset = (page - 1) * pageSize; // Tính toán offset

    // Lấy từ khóa tìm kiếm từ query
    const searchQuery = req.query.search || ""; // Tìm kiếm theo tên Role

    const user = await User.findOne({
      where: { id: req.user.id }, // Lọc theo id của người dùng
      include: [
        {
          model: UserSocial, // Bao gồm thông tin từ bảng UserSocial
          required: false, // Không bắt buộc phải có dữ liệu từ UserSocial
        },
        {
          model: Role, // Bao gồm thông tin từ bảng Role
          required: false, // Không bắt buộc phải có dữ liệu từ Role
          include: {
            model: Permission, // Bao gồm bảng Permission liên kết với Role
            through: { attributes: [] }, // Không lấy thông tin từ bảng trung gian, chỉ lấy quyền
          },
        },
      ],
    });

    // Lấy tất cả các permission của user từ các roles mà user có
    const userPermissions = user.Roles.flatMap((role) =>
      role.Permissions.map((permission) => permission.name)
    );

    // Lấy tất cả các vai trò với điều kiện tìm kiếm theo tên
    const roles = await Role.findAll({
      where: {
        name: {
          [Op.like]: `%${searchQuery}%`, // Tìm kiếm theo tên Role
        },
      },
      include: [
        { model: Permission, required: false }, // Bao gồm thông tin từ bảng Permission
        { model: User, required: false }, // Bao gồm thông tin từ bảng User
      ],
      limit: pageSize,
      offset: offset,
    });

    // Tổng số vai trò để tính toán phân trang
    const totalRoles = await Role.count({
      where: {
        name: {
          [Op.like]: `%${searchQuery}%`, // Tìm kiếm theo tên Role
        },
      },
    });
    const totalPages = Math.ceil(totalRoles / pageSize);

    res.render("Permissions/listRole", {
      title: "List Role",
      user,
      success,
      error,
      roles,
      userPermissions,
      currentPage: page,
      totalPages: totalPages,
      searchQuery, // Gửi từ khóa tìm kiếm vào view
    });
  },
  addRole: async (req, res) => {
    const success = req.flash("success", "");
    const error = req.flash("error", "");
    const user = await User.findOne({
      where: { id: req.user.id }, // Lọc theo id của người dùng
      include: [
        {
          model: UserSocial, // Bao gồm thông tin từ bảng UserSocial
          required: false, // Không bắt buộc phải có dữ liệu từ UserSocial
        },
        {
          model: Role, // Bao gồm thông tin từ bảng Role
          required: false, // Không bắt buộc phải có dữ liệu từ Role
          include: {
            model: Permission, // Bao gồm bảng Permission liên kết với Role
            through: { attributes: [] }, // Không lấy thông tin từ bảng trung gian, chỉ lấy quyền
          },
        },
      ],
    });

    // Lấy tất cả các permission của user từ các roles mà user có
    const userPermissions = user.Roles.flatMap((role) =>
      role.Permissions.map((permission) => permission.name)
    );
    res.render("Permissions/addRole", {
      title: "Add Role",
      user,
      userPermissions,
      success,
      error,
    });
  },
  handleAddRole: async (req, res) => {
    const { name, ...permissions } = req.body;

    const roles = await Role.findAll({
      where: { name },
    });

    if (roles.length > 0) {
      req.flash("error", "Đã có tên vai trò này!");
      return res.redirect("/add-role");
    }

    if (name) {
      await Role.create({ name });
    }

    const role = await Role.findOne({ where: { name } });

    // Lặp qua các quyền và thêm chúng vào role nếu có
    const permissionNames = [
      "user_create",
      "user_edit",
      "user_delete",
      "user_view",
      "project_create",
      "project_edit",
      "project_delete",
      "project_view",
      "task_create",
      "task_edit",
      "task_delete",
      "task_view",
      "role_view",
      "role_create",
      "role_edit",
      "role_delete",
    ];

    for (let perm of permissionNames) {
      if (permissions[perm]) {
        const permission = await Permission.findOne({ where: { name: perm } });
        if (permission) {
          await role.addPermission(permission);
        }
      }
    }
    await ActivityLog.create({
      user_id: req.user.id,
      action: `Bạn đã thêm một vai trò`,
      timestamp: new Date().toLocaleString(),
    });
    req.flash("success", "Thêm vai trò thành công!");
    res.redirect("/add-role");
  },
  editRole: async (req, res) => {
    const id = req.params.id;
    const success = req.flash("success", "");
    const error = req.flash("error", "");
    const user = await User.findOne({
      where: { id: req.user.id }, // Lọc theo id của người dùng
      include: [
        {
          model: UserSocial, // Bao gồm thông tin từ bảng UserSocial
          required: false, // Không bắt buộc phải có dữ liệu từ UserSocial
        },
        {
          model: Role, // Bao gồm thông tin từ bảng Role
          required: false, // Không bắt buộc phải có dữ liệu từ Role
          include: {
            model: Permission, // Bao gồm bảng Permission liên kết với Role
            through: { attributes: [] }, // Không lấy thông tin từ bảng trung gian, chỉ lấy quyền
          },
        },
      ],
    });

    // Lấy tất cả các permission của user từ các roles mà user có
    const userPermissions = user.Roles.flatMap((role) =>
      role.Permissions.map((permission) => permission.name)
    );
    const roleWithPermissions = await Role.findOne({
      where: { id: id }, // Lấy Role theo ID
      include: [
        {
          model: Permission,
          through: { attributes: [] }, // Bỏ qua bảng trung gian RolePermissions
        },
      ],
    });

    if (!roleWithPermissions) {
      req.flash("error", "Không tìm thấy vai trò!");
      return res.redirect("/roles");
    }

    // Định dạng dữ liệu để truyền vào EJS
    const roleData = {
      roleName: roleWithPermissions.name, // Lấy tên Role
      permissions: roleWithPermissions.Permissions.map(
        (permission) => permission.name
      ), // Danh sách Permissions
    };

    res.render("Permissions/editRole", {
      title: "Edit Role",
      user,
      id,
      userPermissions,
      roleData,
      success,
      error,
    });
  },
  handleEditRole: async (req, res) => {
    const id = req.params.id;
    const { name, ...permissions } = req.body;

    const roles = await Role.findOne({
      where: {
        name: name,
        id: { [Op.ne]: id }, // Kiểm tra trừ vai trò có id = req.params.id
      },
    });

    if (roles) {
      req.flash("error", "Đã có tên vai trò này!");
      return res.redirect(`/role/${id}/edit`);
    }

    if (name) {
      await Role.update(
        { name },
        {
          where: {
            id: id,
          },
        }
      );
    }

    const role = await Role.findOne({ where: { id } });

    // Xóa hết tất cả quyền liên kết với role này
    await role.setPermissions([]);
    // Lặp qua các quyền và thêm chúng vào role nếu có
    const permissionNames = [
      "user_create",
      "user_edit",
      "user_delete",
      "user_view",
      "project_create",
      "project_edit",
      "project_delete",
      "project_view",
      "task_create",
      "task_edit",
      "task_delete",
      "task_view",
      "role_view",
      "role_create",
      "role_edit",
      "role_delete",
    ];

    for (let perm of permissionNames) {
      if (permissions[perm]) {
        const permission = await Permission.findOne({ where: { name: perm } });
        if (permission) {
          await role.addPermission(permission);
        }
      }
    }
    await ActivityLog.create({
      user_id: req.user.id,
      action: `Bạn đã thay đổi vai trò ${name}`,
      timestamp: new Date().toLocaleString(),
    });
    req.flash("success", "Sửa vai trò thành công!");
    res.redirect(`/role/${id}/edit`);
  },
  deleteRole: async (req, res) => {
    const { id } = req.params;

    // Kiểm tra xem Role có tồn tại không
    const role = await Role.findOne({ where: { id } });
    const roleName = role.name;
    if (!role) {
      req.flash("error", "Vai trò không tồn tại!");
      return res.redirect("/roles");
    }

    // Kiểm tra nếu role đang được sử dụng trong bảng UserRoles

    // Xóa liên kết giữa Role và Permission trước khi xóa Role
    await role.setPermissions([]);

    // Xóa Role
    await role.destroy();
    await ActivityLog.create({
      user_id: req.user.id,
      action: `Bạn đã xóa vai trò ${roleName}`,
      timestamp: new Date().toLocaleString(),
    });
    req.flash("success", "Đã xóa vai trò thành công!");
    res.redirect("/list-roles");
  },
};
