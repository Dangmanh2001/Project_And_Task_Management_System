const model = require("../../models/index");
const User = model.User;
const Project = model.Project;
const UserSocial = model.UserSocial;
const Role = model.Role;
const Task = model.Task;

module.exports = {
  listProject: async (req, res) => {
    // Hiển thị danh sách dự án

    const success = req.flash("success", "");
    const error = req.flash("error", "");

    const page = parseInt(req.query.page) || 1; // Lấy số trang từ query params, mặc định là 1
    const pageSize = 10; // Số lượng dự án mỗi trang
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

    // Lấy tất cả dự án trong hệ thống
    const projects = await Project.findAll({
      include: [
        {
          model: User,
          required: false,
          include: [
            {
              model: Role, // Bao gồm thông tin vai trò của người dùng
              required: false, // Không bắt buộc phải có thông tin vai trò
            },
          ],
        }, // Lấy thông tin người tạo dự án
      ],
      limit: pageSize,
      offset: offset,
    });

    // Tổng số dự án để tính toán phân trang
    const totalProjects = await Project.count();
    const totalPages = Math.ceil(totalProjects / pageSize);

    res.render("Admin/listProject", {
      title: "List Project",
      success,
      error,
      user,
      projects,
      currentPage: page,
      totalPages: totalPages,
    });
  },
  addProject: async (req, res) => {
    const success = req.flash("success", "");
    const error = req.flash("error", "");

    // Lấy danh sách người dùng (created_by) cho dropdown
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

    // Render form thêm dự án
    res.render("Admin/addProject", {
      title: "Thêm Dự Án",
      success,
      error,
      user, // Truyền danh sách người dùng vào view
    });
  },
  handleAddProject: async (req, res) => {
    try {
      const { name, description, start_date, end_date, status } = req.body;

      // Kiểm tra nếu thiếu thông tin bắt buộc
      if (!name || !description || !start_date || !end_date || !status) {
        req.flash("error", "Vui lòng điền đầy đủ thông tin!");
        return res.redirect("/add-project"); // Quay lại trang thêm dự án
      }

      // Kiểm tra người tạo dự án tồn tại hay không
      const creator = await User.findByPk(req.user.id);
      if (creator.role_id !== 1) {
        req.flash("error", "Bạn không có quyền tạo dự án!");
        return res.redirect("/add-project");
      }

      // Thêm dự án mới vào cơ sở dữ liệu
      await Project.create({
        name,
        description,
        start_date,
        end_date,
        status,
        created_by: creator.id, // Gán người tạo dự án
      });

      req.flash("success", "Dự án đã được thêm thành công!");
      res.redirect("/add-project"); // Chuyển hướng về danh sách dự án
    } catch (error) {
      console.error(error);
      req.flash("error", "Đã xảy ra lỗi khi thêm dự án!");
      res.redirect("/add-project"); // Quay lại trang thêm dự án
    }
  },
  editProject: async (req, res) => {
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
        },
      ],
    });
    const { id } = req.params; // Lấy ID dự án từ URL

    // Lấy tất cả người dùng để hiển thị trong dropdown "Người tạo"
    const users = await User.findAll();

    // Tìm dự án cần sửa
    const project = await Project.findByPk(id, {
      include: [
        {
          model: User,
          required: true,
        },
      ],
    });

    // Kiểm tra xem dự án có tồn tại không
    if (!project) {
      req.flash("error", "Dự án không tồn tại!");
      return res.redirect("/list-project"); // Nếu không có, quay lại danh sách dự án
    }

    // Trả về trang chỉnh sửa dự án với dữ liệu của dự án
    res.render("Admin/editProject", {
      title: "Sửa Dự Án",
      success,
      error,
      user,
      users, // Truyền danh sách người dùng để chọn người tạo
      project, // Truyền thông tin dự án cần sửa
    });
  },

  updateProject: async (req, res) => {
    const { id } = req.params;
    const { name, description, start_date, end_date, status, created_by } =
      req.body;

    try {
      // Kiểm tra nếu thiếu thông tin bắt buộc
      if (
        !name ||
        !description ||
        !start_date ||
        !end_date ||
        !status ||
        !created_by
      ) {
        req.flash("error", "Vui lòng điền đầy đủ thông tin!");
        return res.redirect(`/edit-project/${id}`);
      }

      // Kiểm tra người tạo dự án tồn tại hay không
      const creator = await User.findByPk(created_by);
      if (!creator) {
        req.flash("error", "Người tạo dự án không tồn tại!");
        return res.redirect(`/edit-project/${id}`);
      }
      if (creator.role_id !== 1) {
        req.flash("error", "Người này không có quyền tạo dự án!");
        return res.redirect(`/edit-project/${id}`);
      }
      // Kiểm tra xem người sửa dự án có quyền sửa (người tạo dự án hoặc admin)
      const project = await Project.findByPk(id);
      if (!project) {
        req.flash("error", "Dự án không tồn tại!");
        return res.redirect(`/edit-project/${id}`);
      }

      if (req.user.id !== project.created_by && req.user.role_id !== 1) {
        req.flash("error", "Bạn không có quyền sửa dự án này!");
        return res.redirect(`/edit-project/${id}`); // Nếu không có quyền, quay lại danh sách dự án
      }

      // Cập nhật dự án
      await Project.update(
        { name, description, start_date, end_date, status, created_by },
        { where: { id } }
      );

      req.flash("success", "Dự án đã được cập nhật thành công!");
      res.redirect(`/edit-project/${id}`); // Quay lại danh sách dự án
    } catch (error) {
      console.error(error);
      req.flash("error", "Đã xảy ra lỗi khi cập nhật dự án!");
      res.redirect(`/edit-project/${id}`); // Quay lại trang chỉnh sửa nếu có lỗi
    }
  },
  deleteProject: async (req, res) => {
    const { id } = req.params; // Lấy ID dự án từ URL

    // Kiểm tra nếu dự án không tồn tại
    const project = await Project.findByPk(id);
    if (!project) {
      req.flash("error", "Dự án không tồn tại!");
      return res.redirect("/list-project"); // Quay lại danh sách dự án nếu không tìm thấy
    }

    // Kiểm tra quyền xóa (Chỉ Admin hoặc người tạo dự án mới có quyền xóa)
    if (req.user.id !== project.created_by && req.user.role_id !== 1) {
      req.flash("error", "Bạn không có quyền xóa dự án này!");
      return res.redirect("/list-project");
    }
    await Task.destroy({ where: { project_id: id } });
    // Tiến hành xóa dự án
    await Project.destroy({ where: { id } });

    req.flash("success", "Dự án đã được xóa thành công!");
    res.redirect("/list-project"); // Quay lại trang danh sách dự án
  },
};
