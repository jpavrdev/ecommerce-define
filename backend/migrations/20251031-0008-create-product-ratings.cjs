'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_ratings', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      productId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'products', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      userId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      rating: { type: Sequelize.TINYINT.UNSIGNED, allowNull: false }, // 1..5
      comment: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('product_ratings', ['productId']);
    await queryInterface.addIndex('product_ratings', ['userId']);
    // Cada usuário pode avaliar um produto apenas uma vez
    await queryInterface.addConstraint('product_ratings', {
      fields: ['productId', 'userId'],
      type: 'unique',
      name: 'uniq_product_user_rating'
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('product_ratings');
  }
};

