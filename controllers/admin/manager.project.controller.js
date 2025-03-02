const model = require("../../models/index");
const User = model.User;
const Project = model.Project;
const UserSocial = model.UserSocial;
const Role = model.Role;
const Task = model.Task;
const Permission = model.Permission;
const ActivityLog = model.ActivityLog;
const { Op, Sequelize } = require("sequelize");

module.exports = {
  listProject: async (req, res) => {
    // Hiển thị danh sách dự án

    const success = req.flash("success", "");
    const error = req.flash("error", "");
    const searchQuery = req.query.search || ""; // Lấy từ khóa tìm kiếm từ query (nếu có)

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
      where: {
        [Sequelize.Op.or]: [
          {
            name: {
              [Sequelize.Op.like]: `%${searchQuery}%`, // Tìm kiếm theo tên dự án
            },
          },
          {
            description: {
              [Sequelize.Op.like]: `%${searchQuery}%`, // Tìm kiếm theo mô tả dự án
            },
          },
          {
            status: {
              [Sequelize.Op.like]: `%${searchQuery}%`, // Tìm kiếm theo trạng thái dự án
            },
          },
        ],
      },
      limit: pageSize,
      offset: offset,
    });

    const projectsUser = await Project.findAll({
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
        },
        {
          model: User,
          required: true, // Lọc chỉ lấy các project mà người dùng hiện tại tham gia
          as: "projects", // Đảm bảo rằng alias là "projects" trong mối quan hệ
          where: {
            id: req.user.id, // Lọc chỉ lấy các project mà người dùng hiện tại tham gia
          },
          include: [
            {
              model: Role, // Bao gồm thông tin vai trò của người dùng
              required: false, // Không bắt buộc phải có thông tin vai trò
            },
          ],
        },
      ],
      where: {
        [Sequelize.Op.or]: [
          {
            name: {
              [Sequelize.Op.like]: `%${searchQuery}%`, // Tìm kiếm theo tên dự án
            },
          },
          {
            description: {
              [Sequelize.Op.like]: `%${searchQuery}%`, // Tìm kiếm theo mô tả dự án
            },
          },
          {
            status: {
              [Sequelize.Op.like]: `%${searchQuery}%`, // Tìm kiếm theo trạng thái dự án
            },
          },
        ],
      },

      limit: pageSize,
      offset: offset,
    });
    console.log(projectsUser);

    const totalProjectsUser = await Project.count({
      include: [
        {
          model: User,
          required: true,
          as: "projects", // Sử dụng alias "projects" trong mối quan hệ
          where: {
            id: req.user.id, // Lọc theo người dùng hiện tại
          },
        },
      ],
      where: {
        [Sequelize.Op.or]: [
          {
            name: {
              [Sequelize.Op.like]: `%${searchQuery}%`, // Tìm kiếm theo tên dự án
            },
          },
          {
            description: {
              [Sequelize.Op.like]: `%${searchQuery}%`, // Tìm kiếm theo mô tả dự án
            },
          },
          {
            status: {
              [Sequelize.Op.like]: `%${searchQuery}%`, // Tìm kiếm theo trạng thái dự án
            },
          },
        ],
      },
    });

    const totalPagesUser = Math.ceil(totalProjectsUser / pageSize);

    // Tổng số dự án để tính toán phân trang
    const totalProjects = await Project.count({
      where: {
        [Sequelize.Op.or]: [
          {
            name: {
              [Sequelize.Op.like]: `%${searchQuery}%`, // Tìm kiếm theo tên dự án
            },
          },
          {
            description: {
              [Sequelize.Op.like]: `%${searchQuery}%`, // Tìm kiếm theo mô tả dự án
            },
          },
          {
            status: {
              [Sequelize.Op.like]: `%${searchQuery}%`, // Tìm kiếm theo trạng thái dự án
            },
          },
        ],
      },
    });
    const totalPages = Math.ceil(totalProjects / pageSize);

    res.render("Admin/listProject", {
      title: "List Project",
      success,
      error,
      user,
      projects,
      projectsUser,
      userPermissions,
      searchQuery,
      currentPage: page,
      totalPages: totalPages,
      totalPagesUser: totalPagesUser,
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
    // Render form thêm dự án
    res.render("Admin/addProject", {
      title: "Thêm Dự Án",
      success,
      userPermissions,
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

      // Thêm dự án mới vào cơ sở dữ liệu
      await Project.create({
        name,
        description,
        start_date,
        end_date,
        status,
        created_by: creator.id, // Gán người tạo dự án
      });
      await ActivityLog.create({
        user_id: req.user.id,
        action: `Bạn đã thêm một dự án`,
        timestamp: new Date().toLocaleString(),
      });
      req.flash("success", "Dự án đã được thêm thành công!");
      res.redirect("/add-project"); // Chuyển hướng về danh sách dự án
    } catch (error) {
      console.error(error);
      req.flash("error", "Đã xảy ra lỗi khi thêm dự án!");
      res.redirect("/add-project"); // Quay lại trang thêm dự án
    }
  },
  addUtoP: async (req, res) => {
    const success = req.flash("success", "");
    const error = req.flash("error", "");
    const { id } = req.params;

    try {
      // Tìm dự án theo ID
      const project = await Project.findByPk(id);
      if (!project) {
        req.flash("error", "Dự án không tồn tại!");
        return res.redirect("/list-project");
      }

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
              `(SELECT user_id FROM userprojects WHERE project_id = ${project.id})`
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
            as: "projects",
          },
        ],
      });

      // Tổng số người dùng để tính toán phân trang
      const totalUsers = await User.count({
        where: {
          id: {
            [Op.notIn]: Sequelize.literal(
              `(SELECT user_id FROM userprojects WHERE project_id = ${project.id})`
            ),
          },
        },
      });

      const totalPages = Math.ceil(totalUsers / pageSize);

      // Render trang
      res.render("Admin/addUserToProject", {
        title: "Thêm Người Dùng Vào Dự Án",
        success,
        error,
        users,
        userPermissions,
        currentPage: page,
        totalPages: totalPages,
        user,
        project,
      });
    } catch (error) {
      console.error(error);
      req.flash("error", "Đã xảy ra lỗi khi lấy dữ liệu!");
      res.redirect("/list-project"); // Redirect đến danh sách dự án hoặc trang lỗi
    }
  },
  handleAddUtoP: async (req, res) => {
    const { id } = req.params; // ID dự án
    const { user_id } = req.body; // Mảng các user_id được chọn

    // Kiểm tra nếu không có người dùng nào được chọn
    if (!user_id || (Array.isArray(user_id) && user_id.length === 0)) {
      req.flash("error", "Vui lòng chọn ít nhất một người dùng!");
      return res.redirect(`/add-user-to-project/${id}`);
    }

    try {
      // Tìm dự án theo ID
      const project = await Project.findByPk(id);

      // Kiểm tra nếu dự án không tồn tại
      if (!project) {
        req.flash("error", "Dự án không tồn tại!");
        return res.redirect(`/list-project`);
      }

      // Nếu user_id là mảng, sử dụng phương thức add để thêm tất cả người dùng vào dự án
      if (Array.isArray(user_id)) {
        // Thêm tất cả người dùng vào dự án
        await project.addUsers(user_id);
      } else {
        // Nếu chỉ có một giá trị trong user_id, thêm người dùng đó vào dự án
        await project.addUser(user_id); // Đảm bảo `addUser` đã được định nghĩa trong Sequelize association
      }
      await ActivityLog.create({
        user_id: req.user.id,
        action: `Bạn đã thêm người dùng vào dự án ${project.name}`,
        timestamp: new Date().toLocaleString(),
      });
      req.flash("success", "Người dùng đã được thêm vào dự án!");
      res.redirect(`/add-user-to-project/${id}`);
    } catch (error) {
      console.error(error);
      req.flash("error", "Đã xảy ra lỗi khi thêm người dùng vào dự án!");
      res.redirect(`/add-user-to-project/${id}`);
    }
  },
  removeUToP: async (req, res) => {
    const success = req.flash("success", "");
    const error = req.flash("error", "");
    const { id } = req.params;
    const project = await Project.findByPk(id);
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
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10; // Số lượng người dùng mỗi trang
    const offset = (page - 1) * pageSize;

    const users = await User.findAll({
      limit: pageSize,
      offset: offset,
      include: [
        {
          model: Project,
          where: { id: project.id }, // Lọc người dùng tham gia vào dự án cụ thể
          through: { attributes: [] }, // Không cần lấy thông tin từ bảng trung gian
          required: true, // Chỉ lấy những người dùng có liên kết với dự án
          as: "projects",
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

    // Tính tổng số người dùng đã tham gia vào dự án
    const totalUsers = await User.count({
      include: [
        {
          model: Project,
          where: { id: project.id },
          through: { attributes: [] },
          required: true,
          as: "projects",
        },
      ],
    });

    const totalPages = Math.ceil(totalUsers / pageSize);
    res.render("Admin/removeUserToProject", {
      title: "Xóa Người Dùng Khỏi Dự Án",
      success,
      error,
      users,
      userPermissions,
      currentPage: page,
      totalPages: totalPages,
      user,
      project,
    });
  },
  handleRemoveUToP: async (req, res) => {
    const { id } = req.params; // ID dự án
    const { user_id } = req.body; // Mảng các user_id được chọn

    // Kiểm tra nếu không có người dùng nào được chọn
    if (!user_id || (Array.isArray(user_id) && user_id.length === 0)) {
      req.flash("error", "Vui lòng chọn ít nhất một người dùng!");
      return res.redirect(`/remove-user-from-project/${id}`); // Redirect đến trang xóa người dùng với id dự án
    }

    try {
      // Tìm dự án theo ID
      const project = await Project.findByPk(id);

      // Kiểm tra nếu dự án không tồn tại
      if (!project) {
        req.flash("error", "Dự án không tồn tại!");
        return res.redirect(`/list-project`); // Redirect đến danh sách dự án nếu không tìm thấy dự án
      }

      // Nếu user_id là mảng, sử dụng phương thức remove để xóa tất cả người dùng khỏi dự án
      if (Array.isArray(user_id)) {
        // Xóa tất cả người dùng khỏi dự án
        await project.removeUsers(user_id);
      } else {
        // Nếu chỉ có một người dùng, xóa người đó khỏi dự án
        await project.removeUser(user_id); // Đảm bảo `removeUser` đã được định nghĩa trong Sequelize association
      }
      await ActivityLog.create({
        user_id: req.user.id,
        action: `Bạn đã xóa người dùng khỏi dự án ${project.name}`,
        timestamp: new Date().toLocaleString(),
      });
      req.flash("success", "Người dùng đã được xóa khỏi dự án!");
      // Redirect về trang xóa người dùng khỏi dự án có kèm id
      res.redirect(`/remove-user-from-project/${id}`);
    } catch (error) {
      console.error(error);
      req.flash("error", "Đã xảy ra lỗi khi xóa người dùng khỏi dự án!");
      res.redirect(`/remove-user-from-project/${id}`); // Redirect lại nếu có lỗi
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
      userPermissions,
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

      // Kiểm tra xem người sửa dự án có quyền sửa (người tạo dự án hoặc admin)
      const project = await Project.findByPk(id);
      if (!project) {
        req.flash("error", "Dự án không tồn tại!");
        return res.redirect(`/edit-project/${id}`);
      }

      // Cập nhật dự án
      await Project.update(
        { name, description, start_date, end_date, status, created_by },
        { where: { id } }
      );
      await ActivityLog.create({
        user_id: req.user.id,
        action: `Bạn đã cập nhât dự án ${name}`,
        timestamp: new Date().toLocaleString(),
      });
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
    const projectName = project.name;
    if (!project) {
      req.flash("error", "Dự án không tồn tại!");
      return res.redirect("/list-project"); // Quay lại danh sách dự án nếu không tìm thấy
    }

    await Task.destroy({ where: { project_id: id } });
    // Tiến hành xóa dự án
    await Project.destroy({ where: { id } });
    await ActivityLog.create({
      user_id: req.user.id,
      action: `Bạn đã xóa dự án ${projectName}`,
      timestamp: new Date().toLocaleString(),
    });
    req.flash("success", "Dự án đã được xóa thành công!");
    res.redirect("/list-project"); // Quay lại trang danh sách dự án
  },
};
