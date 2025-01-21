const model = require("../../models/index");
const User = model.User;
const UserSocial = model.UserSocial;
const Role = model.Role;
const bcrypt = require("bcrypt")
const flash = require("connect-flash")
module.exports = {
  index: async (req, res) => {
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
    console.log(user.dataValues.Role)
    res.render("index", {
      title: "Express",
      user,
    });
  },
  profile: async (req, res) => {
    const messages =req.flash("error")
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

    res.render("profile", { title: "Profile", user,messages });
  },

  
  chart: async (req, res) => {
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

    res.render("charts", { title: "Charts", user });
  },
  table: async (req, res) => {
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

    res.render("tables", { title: "Tables", user });
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
  unlinkGoogle:async(req,res)=>{
    const user = req.user
    await UserSocial.destroy({
      where:{
        userId:user.id,
        provider:"google"
      }
    })
    res.redirect("/profile")
  },
  unlinkFacebook:async(req,res)=>{
    const user = req.user
    await UserSocial.destroy({
      where:{
        userId:user.id,
        provider:"facebook"
      }
    })
    res.redirect("/profile")
  },
  changePass:async(req,res)=>{
    const {password,newPassword,confirmPassword}=req.body
    const passwordUser=req.user.password
    const saltRounds = 10;
    
    const isMatch = await bcrypt.compare(password, passwordUser);
    if(isMatch){
      if(newPassword!==confirmPassword){
        req.flash("error","Mật khẩu mới chưa khớp")
        return res.redirect("/profile")
      }
      bcrypt.hash(confirmPassword, saltRounds, async(err, hashedPassword) => {
        if (err) throw err;
        await User.update({password:hashedPassword},{
          where:{
            id:req.user.id
          }
        })
      });
      return res.redirect("/profile")
    }
    else{
      req.flash("error","Mật khẩu sai")
      return res.redirect("/profile")
    }
  }
};
