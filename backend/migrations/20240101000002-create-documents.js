'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('documents', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      file_url: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      mime_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      uploaded_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('documents', ['uploaded_by'], { name: 'documents_uploaded_by_idx' });
    await queryInterface.addIndex('documents', ['title'], { name: 'documents_title_idx' });
    await queryInterface.addIndex('documents', ['created_at'], { name: 'documents_created_at_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('documents');
  },
};
