const model = require("../../models/index");
const User = model.User;
const UserSocial = model.UserSocial;
const Project = model.Project;
const Task = model.Task;
const Role = model.Role;
const { Op, Sequelize } = require("sequelize");

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
      userPermissions,
      currentPage: page,
      totalPages: totalPages,
    });
  },

  addTask: async (req, res) => {
    const success = req.flash("success", "");
    const error = req.flash("error", "");

    // Lấy danh sách người dùng để hiển thị trong dropdown
    const users = await User.findAll();
    const projects = await Project.findAll();
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
    res.render("Admin/addTask", {
      title: "Add Task",
      user,
      success,
      userPermissions,
      error,
      users,
      projects,
    });
  },

  handleAddTask: async (req, res) => {
    const { name, description, status, due_date, assignee, project_id } =
      req.body;

    // Kiểm tra nếu thiếu thông tin bắt buộc
    if (!name || !description || !status || !assignee || !project_id) {
      req.flash("error", "Vui lòng điền đầy đủ thông tin!");
      return res.redirect("/add-task"); // Quay lại trang thêm công việc
    }
    if (!due_date) {
      await Task.create({
        name,
        description,
        status,
        due_date: null,
        assignee,
        project_id,
      });
      req.flash("success", "Công việc đã được thêm thành công!");
      return res.redirect("/add-task"); // Chuyển hướng về danh sách công việc
    }
    // Thêm công việc mới vào cơ sở dữ liệu
    await Task.create({
      name,
      description,
      status,
      due_date,
      assignee,
      project_id, // Gán dự án cho công việc
    });

    req.flash("success", "Công việc đã được thêm thành công!");
    res.redirect("/add-task"); // Chuyển hướng về danh sách công việc
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
    const success = req.flash("success", "");
    const error = req.flash("error", "");
    const taskId = req.params.id;

    // Lấy thông tin công việc
    const task = await Task.findByPk(taskId, {
      include: [
        {
          model: User, // Lấy người giao công việc
          required: true,
        },
        {
          model: Project, // Lấy thông tin dự án liên quan
          required: true,
        },
      ],
    });

    if (!task) {
      req.flash("error", "Công việc không tồn tại!");
      return res.redirect("/list-task"); // Quay lại danh sách công việc nếu không tìm thấy công việc
    }
    const projects = await Project.findAll();
    // Lấy danh sách người giao công việc (assignee)
    const users = await User.findAll();

    res.render("Admin/editTask", {
      title: "Edit Task",
      user,
      success,
      error,
      userPermissions,
      task, // Truyền thông tin công việc cần sửa
      users,
      projects,
    });
  },

  updateTask: async (req, res) => {
    const taskId = req.params.id;
    const { name, description, status, due_date, assignee, project_id } =
      req.body;

    // Kiểm tra dữ liệu
    if (!name || !description || !status || !assignee || !project_id) {
      req.flash("error", "Vui lòng điền đầy đủ thông tin!");
      return res.redirect(`/edit-task/${taskId}`); // Quay lại trang chỉnh sửa nếu thiếu thông tin
    }
    console.log(due_date, 11111);
    if (!due_date) {
      const result = await Task.update(
        { name, description, status, due_date: null, assignee, project_id },
        { where: { id: taskId } }
      );
      req.flash("success", "Công việc đã được cập nhật thành công!");
      return res.redirect(`/edit-task/${taskId}`); // Quay lại danh sách công việc sau khi cập nhật
    }
    // Cập nhật thông tin công việc
    const result = await Task.update(
      { name, description, status, due_date: null, assignee, project_id },
      { where: { id: taskId } }
    );

    // Kiểm tra xem bản ghi có được cập nhật thành công không
    if (result[0] === 0) {
      req.flash("error", "Không tìm thấy công việc để cập nhật!");
      return res.redirect(`/edit-task/${taskId}`);
    }

    req.flash("success", "Công việc đã được cập nhật thành công!");
    res.redirect(`/edit-task/${taskId}`); // Quay lại danh sách công việc sau khi cập nhật
  },
  addUToTask: async (req, res) => {
    const success = req.flash("success", "");
    const error = req.flash("error", "");
    const { id } = req.params;
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
    const task = await Task.findByPk(id);
    if (!task) {
      req.flash("error", "Công việc không tồn tại!");
      return res.redirect("/list-task");
    }
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10; // Số lượng người dùng mỗi trang
    const offset = (page - 1) * pageSize;

    // Lấy danh sách người dùng không có trong bảng userprojects
    const users = await User.findAll({
      limit: pageSize,
      offset: offset,
      where: {
        id: {
          [Op.notIn]: Sequelize.literal(
            `(SELECT user_id FROM taskassignments WHERE task_id = ${task.id})`
          ),
        },
      },
      include: [
        {
          model: UserSocial,
          required: false, // Không yêu cầu phải có thông tin UserSocial
        },
        {
          model: Role,
          required: false, // Không yêu cầu phải có thông tin Role
        },
        {
          model: Project,
          required: false, // Không yêu cầu phải có dự án
        },
      ],
    });

    // Tổng số người dùng để tính toán phân trang
    const totalUsers = await User.count({
      where: {
        id: {
          [Op.notIn]: Sequelize.literal(
            `(SELECT user_id FROM taskassignments WHERE task_id = ${task.id})`
          ),
        },
      },
    });

    const totalPages = Math.ceil(totalUsers / pageSize);

    res.render("Admin/addUserToTask", {
      title: "Thêm người dùng cho công việc",
      success,
      error,
      userPermissions,
      user,
      task,
      users,
      currentPage: page,
      totalPages: totalPages,
    });
  },
  handleAddUToTask: async (req, res) => {
    const { id } = req.params; // ID dự án
    const { user_id } = req.body; // Mảng các user_id được chọn

    // Kiểm tra nếu không có người dùng nào được chọn
    if (!user_id || (Array.isArray(user_id) && user_id.length === 0)) {
      req.flash("error", "Vui lòng chọn ít nhất một người dùng!");
      return res.redirect(`/add-user-to-task/${id}`);
    }

    try {
      // Tìm dự án theo ID
      const task = await Task.findByPk(id);

      // Kiểm tra nếu dự án không tồn tại
      if (!task) {
        req.flash("error", "Công việc không tồn tại!");
        return res.redirect(`/list-task`);
      }

      // Nếu user_id là mảng, sử dụng phương thức add để thêm tất cả người dùng vào dự án
      if (Array.isArray(user_id)) {
        // Thêm tất cả người dùng vào dự án
        await task.addUsers(user_id);
      } else {
        // Nếu chỉ có một giá trị trong user_id, thêm người dùng đó vào dự án
        await task.addUser(user_id); // Đảm bảo `addUser` đã được định nghĩa trong Sequelize association
      }

      req.flash("success", "Người dùng đã được thêm vào công việc!");
      res.redirect(`/add-user-to-task/${id}`);
    } catch (error) {
      console.error(error);
      req.flash("error", "Đã xảy ra lỗi khi thêm người dùng vào công việc!");
      res.redirect(`/add-user-to-task/${id}`);
    }
  },
  removeUToTask: async (req, res) => {
    const success = req.flash("success", "");
    const error = req.flash("error", "");
    const { id } = req.params;
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
    const task = await Task.findByPk(id);
    if (!task) {
      req.flash("error", "Công việc không tồn tại!");
      return res.redirect("/list-task");
    }
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10; // Số lượng người dùng mỗi trang
    const offset = (page - 1) * pageSize;

    const users = await User.findAll({
      limit: pageSize,
      offset: offset,
      include: [
        {
          model: Task,
          where: { id: task.id }, // Lọc người dùng tham gia vào dự án cụ thể
          through: { attributes: [] }, // Không cần lấy thông tin từ bảng trung gian
          required: true, // Chỉ lấy những người dùng có liên kết với dự án
        },
        {
          model: UserSocial,
          required: false, // Không yêu cầu phải có thông tin UserSocial
        },
        {
          model: Role,
          required: false, // Không yêu cầu phải có thông tin Role
        },
      ],
    });

    // Tổng số người dùng để tính toán phân trang
    const totalUsers = await User.count({
      include: [
        {
          model: Task,
          where: { id: task.id },
          through: { attributes: [] },
          required: true,
        },
      ],
    });

    const totalPages = Math.ceil(totalUsers / pageSize);
    res.render("Admin/removeUserToTask", {
      title: "Xóa người dùng khỏi công việc",
      success,
      error,
      user,
      userPermissions,
      task,
      users,
      currentPage: page,
      totalPages: totalPages,
    });
  },
  handleRemoveUToTask: async (req, res) => {
    const { id } = req.params; // ID dự án
    const { user_id } = req.body; // Mảng các user_id được chọn

    // Kiểm tra nếu không có người dùng nào được chọn
    if (!user_id || (Array.isArray(user_id) && user_id.length === 0)) {
      req.flash("error", "Vui lòng chọn ít nhất một người dùng!");
      return res.redirect(`/remove-user-from-task/${id}`); // Redirect đến trang xóa người dùng với id dự án
    }

    try {
      // Tìm dự án theo ID
      const task = await Task.findByPk(id);

      // Kiểm tra nếu dự án không tồn tại
      if (!task) {
        req.flash("error", "Công việc không tồn tại!");
        return res.redirect(`/list-task`); // Redirect đến danh sách dự án nếu không tìm thấy dự án
      }

      // Nếu user_id là mảng, sử dụng phương thức remove để xóa tất cả người dùng khỏi dự án
      if (Array.isArray(user_id)) {
        // Xóa tất cả người dùng khỏi dự án
        await task.removeUsers(user_id);
      } else {
        // Nếu chỉ có một người dùng, xóa người đó khỏi dự án
        await task.removeUser(user_id); // Đảm bảo `removeUser` đã được định nghĩa trong Sequelize association
      }

      req.flash("success", "Người dùng đã được xóa khỏi công việc!");
      // Redirect về trang xóa người dùng khỏi dự án có kèm id
      res.redirect(`/remove-user-from-task/${id}`);
    } catch (error) {
      console.error(error);
      req.flash("error", "Đã xảy ra lỗi khi xóa người dùng khỏi công việc!");
      res.redirect(`/remove-user-from-task/${id}`); // Redirect lại nếu có lỗi
    }
  },

  deleteTask: async (req, res) => {
    const { id } = req.params; // Lấy ID dự án từ URL

    // Kiểm tra nếu dự án không tồn tại
    const task = await Task.findByPk(id);
    if (!task) {
      req.flash("error", "Công việc không tồn tại!");
      return res.redirect("/list-task"); // Quay lại danh sách dự án nếu không tìm thấy
    }

    await task.removeUsers({ where: { task_id: id } });
    await Task.destroy({ where: { id } });

    req.flash("success", "Công việc đã được xóa thành công!");
    res.redirect("/list-task"); // Quay lại trang danh sách dự án
  },
};
