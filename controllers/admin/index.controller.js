const model = require("../../models/index");
const User = model.User;
const UserSocial = model.UserSocial;
const Role = model.Role;
const bcrypt = require("bcrypt");
const Project = model.Project;
const Task = model.Task;
const Permission = model.Permission;
const ActivityLog = model.ActivityLog;
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

module.exports = {
  index: async (req, res) => {
    const message = req.flash("error");
    const success = req.flash("success");
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

    // Log tên của roles

    const totalProjects = await Project.count();

    // Lấy số lượng project có status "Hoàn thành"
    const completedProjects = await Project.count({
      where: { status: "Hoàn thành" },
    });
    // Tìm số lượng dự án có trạng thái "Chưa bắt đầu"
    const notStartedProjects = await Project.count({
      where: { status: "Chưa bắt đầu" },
    });

    // Tìm số lượng dự án có trạng thái "Ngừng hoạt động"
    const inactiveProjects = await Project.count({
      where: { status: "Ngừng hoạt động" },
    });

    // Tìm số lượng dự án có trạng thái "Đang thực hiện"
    const inProgressProjects = await Project.count({
      where: { status: "Đang thực hiện" },
    });

    // Tính phần trăm
    const completionPercentage = parseInt(
      (completedProjects / totalProjects) * 100
    );
    // Tính phần trăm cho trạng thái "Chưa bắt đầu"
    const notStartedPercentage = parseInt(
      (notStartedProjects / totalProjects) * 100
    );

    // Tính phần trăm cho trạng thái "Ngừng hoạt động"
    const inactivePercentage = parseInt(
      (inactiveProjects / totalProjects) * 100
    );

    // Tính phần trăm cho trạng thái "Đang thực hiện"
    const inProgressPercentage = parseInt(
      (inProgressProjects / totalProjects) * 100
    );

    const totalTask = await Task.count();

    // Lấy số lượng project có status "Hoàn thành"
    const completedTask = await Task.count({
      where: { status: "Hoàn thành" },
    });
    // Tính phần trăm
    const completionPercentage1 = parseInt((completedTask / totalTask) * 100);
    res.render("index", {
      title: "Dash Board",
      user,
      totalProjects,
      completionPercentage,
      totalTask,
      completedProjects,
      notStartedProjects,
      inProgressProjects,
      inactiveProjects,
      completionPercentage1,
      notStartedPercentage,
      inactivePercentage,
      inProgressPercentage,
      userPermissions,
      message,
      success,
    });
  },
  profile: async (req, res) => {
    const messages = req.flash("error");
    const success = req.flash("success");
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
    res.render("profile", {
      title: "Profile",
      user,
      messages,
      success,
      userPermissions,
    });
  },
  updateAvatar: async (req, res) => {
    try {
      // Lấy thông tin người dùng từ cơ sở dữ liệu
      const user = await User.findOne({ where: { id: req.user.id } });

      // Kiểm tra xem người dùng đã có ảnh avatar chưa
      if (user.avatar) {
        const currentAvatarPath = path.join("public", user.avatar); // Đường dẫn ảnh hiện tại
        // Kiểm tra nếu ảnh mới giống với ảnh cũ
        if (req.file.filename === path.basename(user.avatar)) {
          req.flash("error", "Ảnh mới giống ảnh cũ. Không cần thay đổi.");
          return res.redirect("/profile");
        }
        // Nếu ảnh cũ khác, xóa ảnh cũ khỏi public
        if (fs.existsSync(currentAvatarPath)) {
          fs.unlinkSync(currentAvatarPath); // Xóa ảnh cũ
        }
      }

      // Lấy đường dẫn ảnh đã tải lên
      const avatarPath = "/images/" + req.file.filename; // Đường dẫn tới ảnh đã được tải lên
      // Cập nhật đường dẫn ảnh vào cơ sở dữ liệu
      const updateU = await User.update(
        { avatar: avatarPath },
        { where: { id: req.user.id } } // Giả sử req.user.id có sẵn từ middleware xác thực
      );
      await ActivityLog.create({
        user_id: req.user.id,
        action: "Bạn đã thay đổi avatar",
        timestamp: new Date().toLocaleString(),
      });
      req.flash("success", "Thay đổi avatar thành công");
      // Quay lại trang profile sau khi cập nhật ảnh
      res.redirect("/profile");
    } catch (error) {
      console.error(error);
      req.flash("error", "Đã xảy ra lỗi khi tải ảnh lên");
      res.redirect("/profile");
    }
  },
  activity: async (req, res) => {
    const success = req.flash("success");
    const error = req.flash("error");
    const searchQuery = req.query.search || ""; // Lấy từ khóa tìm kiếm từ query (nếu có)

    // Lấy người dùng
    const user = await User.findOne({
      where: { id: req.user.id }, // Lọc theo id của người dùng
      include: [
        {
          model: UserSocial, // Bao gồm thông tin từ bảng UserSocial
          required: false,
        },
        {
          model: Role, // Bao gồm thông tin từ bảng Role
          required: false,
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

    // Điều kiện lọc hoạt động theo user_id và từ khóa tìm kiếm trong trường action
    const activities = await ActivityLog.findAll({
      where: {
        user_id: req.user.id, // Lọc theo user_id
        action: {
          [Sequelize.Op.like]: `%${searchQuery}%`, // Tìm kiếm trong trường action
        },
      },
      order: [["timestamp", "DESC"]], // Sắp xếp theo thời gian giảm dần
    });

    // Render lại trang với các dữ liệu đã tìm kiếm
    res.render("Admin/activity", {
      title: "Activity Log",
      user,
      userPermissions,
      success,
      activities,
      error,
      searchQuery, // Gửi lại từ khóa tìm kiếm để hiển thị trên thanh tìm kiếm
    });
  },
  deleteActivityAll: async (req, res) => {
    const id = req.user.id;
    req.flash("success", "Xóa nhật kí hoạt động thành công!");
    await ActivityLog.destroy({
      where: {
        user_id: id,
      },
    });
    res.redirect("/activity");
  },
  deleteActivityId: async (req, res) => {
    const { id } = req.params;
    req.flash("success", "Xóa nhật kí hoạt động thành công!");

    await ActivityLog.destroy({
      where: {
        id: id,
        user_id: req.user.id,
      },
    });
    res.redirect("/activity");
  },
  chart: async (req, res) => {
    try {
      // Lấy thông tin người dùng
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

      // Lấy tổng số người dùng
      const totalUsers = await User.count();

      // Lấy tổng số dự án
      const totalProjects = await Project.count();

      // Lấy tổng số công việc
      const totalTasks = await Task.count();
      const tasks = await Task.findAll();
      const projects = await Project.findAll();

      // Hàm để đếm trạng thái
      const countStatus = (items) => {
        return items.reduce(
          (acc, item) => {
            // Kiểm tra trạng thái và tăng số lượng tương ứng
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
          },
          {
            "Hoàn thành": 0,
            "Chưa bắt đầu": 0,
            "Ngưng hoạt động": 0,
            "Đang thực hiện": 0,
          }
        );
      };

      // Đếm trạng thái cho tasks và projects
      const taskStatusCount = countStatus(tasks);
      const taskStatusValues = Object.values(taskStatusCount);
      const projectStatusCount = countStatus(projects);
      const projectStatusValues = Object.values(projectStatusCount);
      const status = [
        "Hoàn thành",
        "Chưa bắt đầu",
        "Ngưng hoạt động",
        "Đang thực hiện",
      ];

      res.render("charts", {
        title: "Charts",
        user,
        status,
        taskStatusValues,
        projectStatusValues,
        totalUsers,
        totalProjects,
        totalTasks,
        userPermissions,
      });
    } catch (error) {
      console.error(error);
      req.flash("error", "Đã xảy ra lỗi khi tải dữ liệu cho biểu đồ.");
      res.redirect("/");
    }
  },

  tableP: async (req, res) => {
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
    const projectsAdmin = await Project.findAll();
    const eventsAdmin = projectsAdmin.map((project) => ({
      title: project.name,
      start: project.start_date,
      end: project.end_date,
    }));
    const projects = await Project.findAll({
      include: [
        {
          model: User,
          as: "projects", // Alias cho mối quan hệ nhiều-nhiều giữa User và Project
          through: {
            attributes: [], // Không lấy thông tin từ bảng trung gian
          },
          where: {
            id: req.user.id, // Lọc chỉ những dự án mà người dùng có id bằng req.user.id
          },
          attributes: ["id", "name"], // Lấy thông tin người tham gia dự án
          required: true, // Chỉ lấy những dự án có user_id = req.user.id
        },
      ],
    });
    const events = projects.map((project) => ({
      title: project.name,
      start: project.start_date,
      end: project.end_date,
    }));
    console.log(projects);
    res.render("tablesP", {
      title: "Tables Project",
      user,
      eventsAdmin: JSON.stringify(eventsAdmin),
      userPermissions,
      events: JSON.stringify(events),
    });
  },

  tableT: async (req, res) => {
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
    const tasks = await Task.findAll({
      include: [
        {
          model: User,
          as: "users", // Alias cho mối quan hệ nhiều-nhiều giữa User và Project
          through: {
            attributes: [], // Không lấy thông tin từ bảng trung gian
          },
          where: {
            id: req.user.id, // Lọc chỉ những dự án mà người dùng có id bằng req.user.id
          },
          attributes: ["id", "name"], // Lấy thông tin người tham gia dự án
          required: true, // Chỉ lấy những dự án có user_id = req.user.id
        },
      ],
    });

    const tasksAdmin = await Task.findAll();

    // Lấy ngày hôm nay
    const today = new Date().toISOString().split("T")[0]; // Format ngày thành YYYY-MM-DD

    // Chuyển đổi các task thành các sự kiện với start là hôm nay và end là due_date của task
    const events = tasks.map((task) => ({
      title: task.name,
      start: today, // start là ngày hôm nay
      end: task.due_date, // end là due_date của task
    }));
    const eventsAdmin = tasksAdmin.map((task) => ({
      title: task.name,
      start: today, // start là ngày hôm nay
      end: task.due_date, // end là due_date của task
    }));
    res.render("tablesT", {
      title: "Tables Task",
      user,
      userPermissions,
      eventsAdmin: JSON.stringify(eventsAdmin),

      events: JSON.stringify(events),
    });
  },

  unlinkGoogle: async (req, res) => {
    const user = req.user;
    await ActivityLog.create({
      user_id: req.user.id,
      action: "Bạn đã hủy liên kết Google",
      timestamp: new Date().toLocaleString(),
    });
    await UserSocial.destroy({
      where: {
        userId: user.id,
        provider: "google",
      },
    });
    res.redirect("/profile");
  },
  unlinkFacebook: async (req, res) => {
    const user = req.user;
    await ActivityLog.create({
      user_id: req.user.id,
      action: "Bạn đã hủy liên kết Facebook",
      timestamp: new Date().toLocaleString(),
    });
    await UserSocial.destroy({
      where: {
        userId: user.id,
        provider: "facebook",
      },
    });
    res.redirect("/profile");
  },
  changePass: async (req, res) => {
    const { password, newPassword, confirmPassword } = req.body;
    const passwordUser = req.user.password;
    const saltRounds = 10;

    const isMatch = await bcrypt.compare(password, passwordUser);
    if (isMatch) {
      if (newPassword !== confirmPassword) {
        req.flash("error", "Mật khẩu mới chưa khớp");
        return res.redirect("/profile");
      }
      bcrypt.hash(confirmPassword, saltRounds, async (err, hashedPassword) => {
        if (err) throw err;
        await User.update(
          { password: hashedPassword },
          {
            where: {
              id: req.user.id,
            },
          }
        );
      });
      await ActivityLog.create({
        user_id: req.user.id,
        action: "Bạn đã thay đổi mật khẩu",
        timestamp: new Date().toLocaleString(),
      });
      req.flash("success", "Thay đổi mật khẩu thành công");
      return res.redirect("/profile");
    } else {
      req.flash("error", "Mật khẩu sai");
      return res.redirect("/profile");
    }
  },
  assignRole: async (req, res) => {
    const id = req.params.id;
    const error = req.flash("error");
    const success = req.flash("success");

    // Lấy thông tin của người dùng hiện tại
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
    // Lấy tất cả các roles
    const roles = await Role.findAll();

    // Lấy thông tin của user
    const userRole = await User.findOne({
      where: { id: req.params.id }, // Hoặc `id` từ `req.params.id` nếu là chỉnh sửa
      include: [
        {
          model: Role, // Lấy vai trò của người dùng
          required: false,
        },
      ],
    });

    // Truyền dữ liệu vào EJS
    res.render("Admin/assignRole", {
      title: "Decentralization",
      error,
      success,
      user,
      id,
      userPermissions,
      roles, // Tất cả các roles
      userRole, // Roles của user có id = req.params.id
    });
  },
  handleAssignRole: async (req, res) => {
    const { id } = req.params; // Lấy id của user từ params
    const { role_name } = req.body; // Lấy role mới từ form

    // Lấy thông tin user theo id
    const user = await User.findOne({
      where: { id },
      include: [
        {
          model: Role, // Lấy thông tin các role liên kết
          through: { attributes: [] }, // Bỏ qua bảng trung gian
        },
      ],
    });

    // Xóa hết tất cả các role của user
    await user.setRoles([]); // Xóa hết các role hiện tại liên kết với user

    // Nếu có role mới được chọn, thêm role đó vào user
    if (role_name) {
      const role = await Role.findByPk(role_name);
      if (role) {
        await user.addRole(role); // Thêm role mới vào user
      }
    }
    await ActivityLog.create({
      user_id: req.user.id,
      action: `Bạn đã cập nhật vai trò của ${user.name}`,
      timestamp: new Date().toLocaleString(),
    });
    req.flash("success", "Cập nhật vai trò người dùng thành công!");
    res.redirect(`/assign-role/${id}`);
  },
};
