"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      Task.belongsTo(models.User, {
        foreignKey: "assignee",
        onDelete: "CASCADE",
      });
      Task.belongsToMany(models.User, {
        through: "TaskAssignments",
        foreignKey: "task_id",
        otherKey: "user_id",
        onDelete: "CASCADE",
        as: "users",
      });

      Task.belongsTo(models.Project, {
        foreignKey: "project_id",
        onDelete: "CASCADE", // Xóa tất cả projects liên quan khi xóa dự án
      });

      Task.belongsToMany(models.Project, {
        through: "ProjectTasks",
        foreignKey: "task_id",
      });
    }
  }
  Task.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      project_id: DataTypes.INTEGER,
      assignee: DataTypes.INTEGER,
      status: DataTypes.STRING,
      due_date: {
        type: DataTypes.DATE,
        allowNull: true, // Cho phép giá trị null
      },
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
      modelName: "Task",
    }
  );
  return Task;
};
