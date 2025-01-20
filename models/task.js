"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      Task.belongsTo(models.Project, {
        foreignKey: "project_id",
      });
      Task.belongsTo(models.User, {
        foreignKey: "assignee",
      });
      Task.belongsToMany(models.Project, {
        through: "ProjectTasks",
        foreignKey: "task_id",
      });
      Task.belongsToMany(models.User, {
        through: "TaskAssignments",
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
      due_date: DataTypes.DATE,
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
