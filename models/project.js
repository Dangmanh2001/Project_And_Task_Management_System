"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate(models) {
      Project.belongsToMany(models.User, {
        through: "UserProjects",
        foreignKey: "project_id",
        otherKey: "user_id",
        as: "users",
      });
      Project.belongsTo(models.User, {
        foreignKey: "created_by",
      });
      Project.hasMany(models.Task, {
        foreignKey: "project_id",
        onDelete: "CASCADE", // Xóa tất cả tasks liên quan khi xóa dự án
      });

      Project.belongsToMany(models.Task, {
        through: "ProjectTasks",
        foreignKey: "project_id",
      });
    }
  }
  Project.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      start_date: DataTypes.DATE,
      end_date: DataTypes.DATE,
      status: DataTypes.STRING,
      created_by: DataTypes.INTEGER,
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
      modelName: "Project",
    }
  );
  return Project;
};
