const model = require("../../models/index");
const User = model.User;
const UserSocial = model.UserSocial;
const Role = model.Role;
const Project = model.Project;
const Task = model.Task;
const Permission = model.Permission;
const ActivityLog = model.ActivityLog;
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

module.exports = {
  listUser: async (req, res) => {
    const success = req.flash("success", "");
    const error = req.flash("error", "");

    const searchQuery = req.query.search || ""; // Lấy từ khóa tìm kiếm từ query (nếu có)

    const page = parseInt(req.query.page) || 1; // Lấy số trang từ query params, mặc định là 1
    const pageSize = 10; // Số lượng người dùng mỗi trang
    const offset = (page - 1) * pageSize; // Tính toán offset

    const user = await User.findOne({
      where: { id: req.user.id }, // Lọc theo id của người dùng
      include: [
        {
          model: Role, // Bao gồm thông tin từ bảng Role
          include: {
            model: Permission, // Bao gồm Permissions từ Role
            through: { attributes: [] }, // Bỏ qua bảng trung gian
          },
        },
      ],
    });

    // Lấy tất cả quyền của user từ các roles mà user có
    const userPermissions = user.Roles.flatMap((role) =>
      role.Permissions.map((permission) => permission.name)
    );

    // Lấy tất cả người dùng trong hệ thống
    const users = await User.findAll({
      include: [
        { model: UserSocial, required: false },
        { model: Role, required: false },
      ],
      where: {
        [Op.or]: [
          {
            name: {
              [Op.like]: `%${searchQuery}%`, // Tìm kiếm theo tên người dùng
            },
          },
          {
            email: {
              [Op.like]: `%${searchQuery}%`, // Tìm kiếm theo email người dùng
            },
          },
        ],
      },
      limit: pageSize,
      offset: offset,
    });

    // Tổng số người dùng để tính toán phân trang
    const totalUsers = await User.count({
      where: {
        [Op.or]: [
          {
            name: {
              [Op.like]: `%${searchQuery}%`, // Tìm kiếm theo tên người dùng
            },
          },
          {
            email: {
              [Op.like]: `%${searchQuery}%`, // Tìm kiếm theo email người dùng
            },
          },
        ],
      },
    });
    const totalPages = Math.ceil(totalUsers / pageSize);
    res.render("Admin/listUser", {
      title: "List User",
      user,
      success,
      error,
      users,
      searchQuery,
      userPermissions,
      currentPage: page,
      totalPages: totalPages,
    });
  },
  addUser: async (req, res) => {
    const success = req.flash("success", "");
    const error = req.flash("error", "");
    const roles = await Role.findAll(); // Lấy tất cả vai trò

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
    res.render("Admin/addUser", {
      title: "Add User",
      user,
      userPermissions,
      error,
      success,
      roles,
    });
  },
  handleAddU: async (req, res) => {
    const { name, email, password, role } = req.body;

    // Kiểm tra xem các trường có đầy đủ không
    if (!name || !email || !password || !role) {
      req.flash(
        "error",
        "Tất cả các trường (Tên, Email, Mật khẩu, Vai trò) là bắt buộc!"
      );
      return res.redirect("/add-user"); // Quay lại trang thêm người dùng
    }

    // Kiểm tra email đã tồn tại chưa
    const userExist = await User.findOne({ where: { email } });
    if (userExist) {
      req.flash("error", "Email này đã được sử dụng!");
      return res.redirect("/add-user");
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Thêm người dùng mới vào cơ sở dữ liệu
    await User.create({
      name,
      email,
      password: hashedPassword,
      role_id: role,
    });
    await ActivityLog.create({
      user_id: req.user.id,
      action: `Bạn đã thêm người dùng ${name}`,
      timestamp: new Date().toLocaleString(),
    });
    req.flash("success", "Người dùng đã được thêm thành công!");
    res.redirect("/add-user");
  },

  editUser: async (req, res) => {
    const success = req.flash("success", "");
    const error = req.flash("error", "");
    const { id } = req.params;
    const roles = await Role.findAll(); // Lấy tất cả vai trò
    const userE = await User.findOne({
      where: { id: id }, // Lọc theo id của người dùng
      include: [
        {
          model: UserSocial, // Bao gồm thông tin từ bảng UserSocial
          required: false, // Không bắt buộc phải có dữ liệu từ UserSocial
        },

        {
          model: Role, // Bao gồm thông tin từ bảng Role
          required: false, // Không bắt buộc phải có dữ liệu từ Role
        },
      ],
    });
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

    res.render("Admin/editUser", {
      title: "Edit User",
      user,
      userPermissions,
      userE,
      id,
      roles,
      error,
      success,
    });
  },
  updateUser: async (req, res) => {
    const { id } = req.params;
    const { name, email, password, confirmPassword } = req.body;
    const user = await User.findByPk(id);

    // Kiểm tra sự tồn tại của các trường bắt buộc
    if (!name || !email) {
      req.flash(
        "error",
        "Tất cả các trường bắt buộc phải có, ngoại trừ mật khẩu!"
      );
      return res.redirect(`/edit-user/${id}`);
    }
    const existingUser = await User.findOne({
      where: {
        email: email,
        id: { [Op.ne]: id }, // Đảm bảo email không trùng với bất kỳ user nào trừ user hiện tại
      },
    });

    if (existingUser) {
      req.flash("error", "Email đã được sử dụng bởi người dùng khác!");
      return res.redirect(`/edit-user/${id}`);
    }
    // Kiểm tra mật khẩu và xác nhận mật khẩu (nếu có)
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        req.flash("error", "Mật khẩu và xác nhận mật khẩu không khớp!");
        return res.redirect(`/edit-user/${id}`);
      }
      // Nếu mật khẩu khớp, mã hóa mật khẩu
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      // Cập nhật mật khẩu
      await User.update({ password: hashedPassword }, { where: { id } });
    }
    // Cập nhật các trường còn lại (trừ mật khẩu)
    await User.update(
      { name, email }, // Cập nhật tên, email, và vai trò
      { where: { id } }
    );
    await ActivityLog.create({
      user_id: req.user.id,
      action: `Bạn đã thay đổi thông tin người dùng ${name}`,
      timestamp: new Date().toLocaleString(),
    });
    req.flash("success", "Thông tin người dùng đã được cập nhật!");
    res.redirect(`/edit-user/${id}`);
  },

  deleteUser: async (req, res) => {
    const { id } = req.params;
    const userDelete = await User.findByPk(id);
    const userNameDelete = userDelete.name;

    // Xóa người dùng với id tương ứng
    const deletedUser = await User.destroy({
      where: { id },
    });

    if (deletedUser) {
      await ActivityLog.create({
        user_id: req.user.id,
        action: `Bạn đã xóa người dùng ${userNameDelete}`,
        timestamp: new Date().toLocaleString(),
      });
      req.flash("success", "Người dùng đã được xóa thành công!");
    } else {
      req.flash("error", "Không tìm thấy người dùng để xóa!");
    }

    res.redirect("/list-user"); // Quay lại trang danh sách người dùng
  },
};
