const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define(
	"User",
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true
		},
		username: {
			type: DataTypes.STRING(45),
			unique: true,
			allowNull: false
		},
		passwordHash: {
			type: DataTypes.STRING(255),
			allowNull: false
		}
	},
	{
		tableName: "users",
		underscored: true
	}
);

module.exports = User;