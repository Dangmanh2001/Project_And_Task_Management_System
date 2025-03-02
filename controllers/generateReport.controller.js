const xlsx = require("xlsx"); // Thư viện xử lý Excel
const model = require("../models/index");
const Role = model.Role; // Import model vai trò
const User = model.User;
const Project = model.Project;
const Task = model.Task;

module.exports = {
  role: async (req, res) => {
    try {
      // Lấy danh sách vai trò từ cơ sở dữ liệu
      const roles = await Role.findAll();

      // Tạo dữ liệu cho file Excel
      const data = roles.map((role, i) => ({
        "Số thứ tự": i + 1,
        "Tên Vai trò": role.name, // Cột Tên vai trò
        "Ngày tạo": role.createdAt, // Cột Ngày tạo
        "Cập nhật lần cuối": role.updatedAt, // Cột Cập nhật lần cuối
      }));

      // Tạo một workbook và worksheet
      const ws = xlsx.utils.json_to_sheet(data); // Chuyển đổi JSON thành worksheet
      const wb = xlsx.utils.book_new(); // Tạo một workbook mới
      xlsx.utils.book_append_sheet(wb, ws, "Vai trò"); // Thêm sheet vào workbook

      // Lưu workbook vào file Excel trong bộ nhớ
      // Chuyển workbook thành file buffer
      const excelBuffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });

      // Gửi file Excel cho người dùng tải về
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=Vai_Tro_Report.xlsx"
      ); // Set tên file tải về
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.send(excelBuffer); // Gửi dữ liệu buffer của file Excel
    } catch (error) {
      console.error("Lỗi khi tạo báo cáo:", error.message);
      res.redirect("/error");
    }
  },
  user: async (req, res) => {
    try {
      // Lấy danh sách tất cả người dùng từ cơ sở dữ liệu (loại bỏ password)
      const users = await User.findAll({
        attributes: ["id", "name", "email", "avatar", "createdAt", "updatedAt"], // Chỉ lấy các trường cần thiết
      });

      // Kiểm tra nếu không có dữ liệu
      if (users.length === 0) {
        return res.status(404).send("Không có người dùng nào trong hệ thống.");
      }

      // Tạo dữ liệu cho file Excel từ danh sách người dùng
      const data = users.map((user, i) => ({
        "Số thứ tự": i + 1,
        "Tên người dùng": user.name, // Cột Tên người dùng
        Email: user.email, // Cột Email
        "Ngày tạo": user.createdAt, // Cột Ngày tạo
        "Cập nhật lần cuối": user.updatedAt, // Cột Cập nhật lần cuối
      }));

      // Tạo một workbook và worksheet
      const ws = xlsx.utils.json_to_sheet(data); // Chuyển đổi JSON thành worksheet
      const wb = xlsx.utils.book_new(); // Tạo một workbook mới
      xlsx.utils.book_append_sheet(wb, ws, "Người dùng"); // Thêm sheet vào workbook

      // Chuyển workbook thành file buffer
      const excelBuffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });

      // Gửi file Excel cho người dùng tải về
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=User_Report.xlsx" // Set tên file tải về
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.send(excelBuffer); // Gửi dữ liệu buffer của file Excel
    } catch (error) {
      console.error("Lỗi khi tạo báo cáo:", error.message);
      res.status(500).send("Có lỗi xảy ra khi tạo báo cáo.");
    }
  },
  project: async (req, res) => {
    try {
      // Lấy danh sách tất cả dự án từ cơ sở dữ liệu
      const projects = await Project.findAll({
        attributes: [
          "id",
          "name",
          "description",
          "start_date",
          "end_date",
          "status",
          "created_by",
          "createdAt",
          "updatedAt",
        ], // Lấy các trường cần thiết
      });

      // Kiểm tra nếu không có dữ liệu
      if (projects.length === 0) {
        return res.status(404).send("Không có dự án nào trong hệ thống.");
      }

      // Tạo dữ liệu cho file Excel từ danh sách dự án
      const data = projects.map((project, i) => ({
        "Số thứ tự": i + 1,
        "Tên dự án": project.name, // Cột Tên dự án
        "Mô tả": project.description, // Cột Mô tả
        "Ngày bắt đầu": project.start_date, // Cột Ngày bắt đầu
        "Ngày kết thúc": project.end_date, // Cột Ngày kết thúc
        "Trạng thái": project.status, // Cột Trạng thái
        "Ngày tạo": project.createdAt, // Cột Ngày tạo
        "Cập nhật lần cuối": project.updatedAt, // Cột Cập nhật lần cuối
      }));

      // Tạo một workbook và worksheet
      const ws = xlsx.utils.json_to_sheet(data); // Chuyển đổi JSON thành worksheet
      const wb = xlsx.utils.book_new(); // Tạo một workbook mới
      xlsx.utils.book_append_sheet(wb, ws, "Dự án"); // Thêm sheet vào workbook

      // Chuyển workbook thành file buffer
      const excelBuffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });

      // Gửi file Excel cho người dùng tải về
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=Project_Report.xlsx" // Set tên file tải về
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.send(excelBuffer); // Gửi dữ liệu buffer của file Excel
    } catch (error) {
      console.error("Lỗi khi tạo báo cáo:", error.message);
      res.status(500).send("Có lỗi xảy ra khi tạo báo cáo.");
    }
  },
  task: async (req, res) => {
    try {
      // Lấy danh sách tất cả tasks từ cơ sở dữ liệu (loại bỏ các trường không cần thiết)
      const tasks = await Task.findAll({
        attributes: [
          "id",
          "name",
          "description",
          "status",
          "due_date",
          "createdAt",
          "updatedAt",
        ], // Lấy các trường cần thiết
      });

      // Kiểm tra nếu không có dữ liệu
      if (tasks.length === 0) {
        return res.status(404).send("Không có nhiệm vụ nào trong hệ thống.");
      }

      // Tạo dữ liệu cho file Excel từ danh sách tasks
      const data = tasks.map((task, i) => ({
        "Số thứ tự": i + 1,
        "Tên nhiệm vụ": task.name, // Cột Tên nhiệm vụ
        "Mô tả": task.description, // Cột Mô tả
        "Trạng thái": task.status, // Cột Trạng thái
        "Ngày đến hạn": task.due_date, // Cột Ngày đến hạn
        "Ngày tạo": task.createdAt, // Cột Ngày tạo
        "Cập nhật lần cuối": task.updatedAt, // Cột Cập nhật lần cuối
      }));

      // Tạo một workbook và worksheet
      const ws = xlsx.utils.json_to_sheet(data); // Chuyển đổi JSON thành worksheet
      const wb = xlsx.utils.book_new(); // Tạo một workbook mới
      xlsx.utils.book_append_sheet(wb, ws, "Nhiệm vụ"); // Thêm sheet vào workbook

      // Chuyển workbook thành file buffer
      const excelBuffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });

      // Gửi file Excel cho người dùng tải về
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=Task_Report.xlsx" // Set tên file tải về
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.send(excelBuffer); // Gửi dữ liệu buffer của file Excel
    } catch (error) {
      console.error("Lỗi khi tạo báo cáo:", error.message);
      res.status(500).send("Có lỗi xảy ra khi tạo báo cáo.");
    }
  },
};
