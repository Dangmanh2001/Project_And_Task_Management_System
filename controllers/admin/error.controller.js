const model = require("../../models/index");
const User = model.User;
const UserSocial = model.UserSocial;
const Role = model.Role;

module.exports = {
    error:async(req,res)=>{
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
            res.render("error",{
                title:"Not Found",user
            })
    }
}