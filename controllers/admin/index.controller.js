const model = require("../../models/index");
const User = model.User;
const UserSocial = model.UserSocial;
const Role = model.Role;
const bcrypt = require("bcrypt");
const Project = model.Project;
const Task = model.Task;
const fs = require("fs");
const path = require("path");
const { Op, Sequelize, where } = require("sequelize");

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
        },
      ],
    });
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
        },
      ],
    });

    res.render("profile", { title: "Profile", user, messages, success });
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
      await User.update(
        { avatar: avatarPath },
        { where: { id: req.user.id } } // Giả sử req.user.id có sẵn từ middleware xác thực
      );
      req.flash("success", "Thay đổi avatar thành công");
      // Quay lại trang profile sau khi cập nhật ảnh
      res.redirect("/profile");
    } catch (error) {
      console.error(error);
      req.flash("error", "Đã xảy ra lỗi khi tải ảnh lên");
      res.redirect("/profile");
    }
  },
  chart: async (req, res) => {
    try {
      // Lấy thông tin người dùng
      const user = await User.findOne({
        where: { id: req.user.id },
        include: [
          {
            model: UserSocial,
            required: false,
          },
          {
            model: Role,
            required: false,
          },
        ],
      });

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
        },
      ],
    });
    const projects = await Project.findAll({
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
    console.log(projects);
    const events = projects.map((project) => ({
      title: project.name,
      start: project.start_date,
      end: project.end_date,
    }));

    res.render("tablesP", {
      title: "Tables Project",
      user,
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
        },
      ],
    });
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
    console.log(tasks);

    // Lấy ngày hôm nay
    const today = new Date().toISOString().split("T")[0]; // Format ngày thành YYYY-MM-DD

    // Chuyển đổi các task thành các sự kiện với start là hôm nay và end là due_date của task
    const events = tasks.map((task) => ({
      title: task.name,
      start: today, // start là ngày hôm nay
      end: task.due_date, // end là due_date của task
    }));

    console.log(events);

    res.render("tablesT", {
      title: "Tables Task",
      user,
      events: JSON.stringify(events),
    });
  },

  setting: async (req, res) => {
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

    res.render("settings", { title: "Setting", user });
  },
  unlinkGoogle: async (req, res) => {
    const user = req.user;
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
      return res.redirect("/profile");
    } else {
      req.flash("error", "Mật khẩu sai");
      return res.redirect("/profile");
    }
  },
};
