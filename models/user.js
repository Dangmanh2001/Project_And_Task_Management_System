"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsToMany(models.Project, {
        through: "UserProjects",
        foreignKey: "user_id", // Cột khóa ngoại của user
        otherKey: "project_id", // Cột khóa ngoại của project
        as: "projects",
      });
      User.belongsToMany(models.Task, {
        through: "TaskAssignments",
        foreignKey: "user_id", // Cột khóa ngoại của user
        otherKey: "task_id", // Cột khóa ngoại của project
        onDelete: "CASCADE",
        as: "users",
      });
      User.belongsTo(models.Role, {
        foreignKey: "role_id", // Khóa ngoại trong bảng User liên kết với bảng Role
      });
      User.hasMany(models.UserSocial, {
        foreignKey: "userId",
      });
      User.belongsToMany(models.Permission, {
        through: "user_permissions", // Tên bảng trung gian
        foreignKey: "user_id", // Khóa ngoại của user
        otherKey: "permission_id", // Khóa ngoại của permission
        onDelete: "CASCADE",
      });

      User.belongsToMany(models.Role, {
        through: "UserRoles",
        foreignKey: "user_id",
      });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      role_id: DataTypes.INTEGER,
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
