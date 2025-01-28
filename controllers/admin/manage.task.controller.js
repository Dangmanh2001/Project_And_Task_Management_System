const model = require("../../models/index");
const User = model.User;
const UserSocial = model.UserSocial;
const Project = model.Project;
const Task = model.Task;
const Role = model.Role;

module.exports = {
  listTask: async (req, res) => {
    const success = req.flash("success", "");
    const error = req.flash("error", "");

    const page = parseInt(req.query.page) || 1; // Lấy số trang từ query params, mặc định là 1
    const pageSize = 10; // Số lượng công việc mỗi trang
    const offset = (page - 1) * pageSize; // Tính toán offset

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
        },
      ],
    });

    // Lấy tất cả công việc trong hệ thống
    const tasks = await Task.findAll({
      include: [
        {
          model: Project,
          required: false,
        },
        {
          model: User,
          required: false,
        },
      ],
      limit: pageSize,
      offset: offset,
    });

    // Tổng số công việc để tính toán phân trang
    const totalTasks = await Task.count();
    const totalPages = Math.ceil(totalTasks / pageSize);

    res.render("Admin/listTask", {
      title: "List Task",
      success,
      error,
      user,
      tasks,
      currentPage: page,
      totalPages: totalPages,
    });
  },

  addTask: async (req, res) => {
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
        },
      ],
    });
    res.render("Admin/addTask", { title: "Add Task", user });
  },

  editTask: async (req, res) => {
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
        },
      ],
    });
    res.render("Admin/editTask", { title: "Edit Task", user });
  },

  deleteTask: async (req, res) => {
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
        },
      ],
    });
    res.render("Admin/deleteTask", { title: "Delete Task", user });
  },
};
