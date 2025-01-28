var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const passport = require("passport");
const localPassport = require("./passports/localPassport"); // Chắc chắn đã import đúng file localPassport.js
const facebookPassport = require("./passports/facebookPassport");
const googlePassport = require("./passports/googlePassport");
const flash = require("connect-flash");
const model = require("./models/index");
const authMiddleware = require("./middleware/auth.middleware");

var adminRouter = require("./routes/Admin/index");
const authRouter = require("./routes/auth");
const errorRouter = require("./routes/error");

var app = express();

// Cấu hình express-session
app.use(
  session({
    secret: "dangmanh1", // Bạn có thể thay đổi secret cho bảo mật
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());

// Cấu hình Passport
app.use(passport.initialize());
app.use(passport.session());

// Cấu hình Local Passport strategy
passport.use("local", localPassport);
passport.use("facebook", facebookPassport);
passport.use("google", googlePassport);

passport.serializeUser(function (user, done) {
  done(null, user.id); // Lưu id người dùng vào session
});

passport.deserializeUser(async function (id, done) {
  const user = await model.User.findByPk(id); // Lấy thông tin người dùng từ cơ sở dữ liệu
  done(null, user);
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Sử dụng express-ejs-layouts
app.use(expressLayouts);

// Middleware khác
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  res.locals.layout = "layouts/home.layout.ejs"; // Layout mặc định
  next();
});

// Route
app.use("/auth", authRouter);

app.use("/", authMiddleware.isLoggedIn, adminRouter);
app.use("/error", authMiddleware.isLoggedIn, errorRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.redirect("/error");
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
