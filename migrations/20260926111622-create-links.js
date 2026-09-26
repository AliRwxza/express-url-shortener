'use strict';
const {DataTypes} = require('sequelize');


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable("links", {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      }, 
      
      alias: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false,
      },

      url: {
        type: DataTypes.TEXT,
        allowNull: false
      }, 

      user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,

        references: {
          model: "users",
          key: "id"
        },

        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },

      click_count: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
        allowNull: false
      },
      
      expires_at: {
        type: DataTypes.DATE
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable("links");
  }
};
