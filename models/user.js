"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Task, {
        foreignKey: "assignee",
        onDelete: "CASCADE",
      });
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
      User.belongsToMany(models.Role, {
        through: "UserRoles",
        foreignKey: "user_id", // Khóa ngoại trong bảng User liên kết với bảng Role
        otherKey: "role_id", // Cột khóa ngoại của project
        onDelete: "CASCADE",
      });
      User.hasMany(models.UserSocial, {
        foreignKey: "userId",
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
      avatar: DataTypes.STRING,
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
