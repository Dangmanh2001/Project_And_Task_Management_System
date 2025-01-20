"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserSocial extends Model {
    static associate(models) {
      UserSocial.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }
  }
  UserSocial.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: DataTypes.INTEGER,
      providerId: DataTypes.STRING,
      provider: DataTypes.STRING,
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
      modelName: "UserSocial",
      tableName: "user_socials", // Chỉ rõ tên bảng trong cơ sở dữ liệ
    }
  );
  return UserSocial;
};
