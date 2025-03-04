"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ActivityLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ActivityLog.belongsTo(models.User, { foreignKey: "user_id" });
    }
  }
  ActivityLog.init(
    {
      user_id: DataTypes.INTEGER,
      action: DataTypes.STRING,
      timestamp: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "ActivityLog",
    }
  );
  return ActivityLog;
};
