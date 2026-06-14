'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash('Password123', 12);

    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        name: 'Alice Admin',
        email: 'admin@docvault.io',
        password: passwordHash,
        role: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Bob Manager',
        email: 'manager@docvault.io',
        password: passwordHash,
        role: 'MANAGER',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Eve Employee',
        email: 'employee@docvault.io',
        password: passwordHash,
        role: 'EMPLOYEE',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      email: ['admin@docvault.io', 'manager@docvault.io', 'employee@docvault.io'],
    });
  },
};
