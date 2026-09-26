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
    await queryInterface.createTable("click_events", {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      }, 

      linkId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        
        references: {
          model: "links",
          key: "id"
        },

        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      
      ipAddress: {
        type: DataTypes.STRING(45)
      },
      
      userAgent: {
        type: DataTypes.TEXT,
      },
      
      referrer: {
        type: DataTypes.TEXT
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
    await queryInterface.dropTable("click_events");
  }
};
