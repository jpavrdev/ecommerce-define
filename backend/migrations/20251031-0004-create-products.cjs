'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(240), allowNull: false },
      sku: { type: Sequelize.STRING(80), allowNull: false, unique: true },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      characteristics: { type: Sequelize.JSON, allowNull: true },
      specifications: { type: Sequelize.JSON, allowNull: true },
      imageUrl: { type: Sequelize.STRING(1024), allowNull: true },
      images: { type: Sequelize.JSON, allowNull: true },
      brandId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: 'brands', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('products', ['name']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('products');
  },
};

