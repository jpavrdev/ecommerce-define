'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const emails = [
      { firstName: 'Ana', lastName: 'Silva', email: 'seeduser1@example.com' },
      { firstName: 'Bruno', lastName: 'Souza', email: 'seeduser2@example.com' },
      { firstName: 'Carla', lastName: 'Oliveira', email: 'seeduser3@example.com' },
      { firstName: 'Diego', lastName: 'Santos', email: 'seeduser4@example.com' },
    ];
    const passwordHash = bcrypt.hashSync('Senha123!', 10);
    const rows = emails.map(u => ({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      passwordHash,
      role: 'user',
      dateOfBirth: null,
      emailVerifiedAt: now,
      createdAt: now,
      updatedAt: now,
    }));
    // idempotente: remove se existir
    await queryInterface.bulkDelete('users', { email: rows.map(r => r.email) });
    await queryInterface.bulkInsert('users', rows);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: [
      'seeduser1@example.com','seeduser2@example.com','seeduser3@example.com','seeduser4@example.com'
    ] });
  }
};

