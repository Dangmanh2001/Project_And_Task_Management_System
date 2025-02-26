"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      Role.belongsToMany(models.Permission, {
        through: "RolePermissions",
        foreignKey: "role_id",
        otherKey: "permission_id", // Khóa ngoại của user
        onDelete: "CASCADE",
      });
      Role.belongsToMany(models.User, {
        through: "UserRoles",
        foreignKey: "role_id",
        otherKey: "user_id", // Khóa ngoại của user
        onDelete: "CASCADE",
      });
    }
  }
  Role.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
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
      modelName: "Role",
    }
  );
  return Role;
};
