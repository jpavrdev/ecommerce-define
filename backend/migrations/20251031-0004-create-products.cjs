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
      imageData: { type: Sequelize.BLOB('long'), allowNull: true },
      imageMimeType: { type: Sequelize.STRING(128), allowNull: true },
      images: { type: Sequelize.JSON, allowNull: true },
      brandId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: 'brands', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      categoryId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'categories', key: 'id' }, onUpdate: 'CASCADE' },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('products', ['name']);
    await queryInterface.addIndex('products', ['categoryId']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('products');
  },
};
