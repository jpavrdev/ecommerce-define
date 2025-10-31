'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const passwordHash = bcrypt.hashSync('Peedriinho259!', 10);
    await queryInterface.bulkInsert('users', [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'dev@dev.com',
        passwordHash,
        role: 'admin',
        dateOfBirth: null,
        emailVerifiedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'dev@dev.com' }, {});
  }
};

