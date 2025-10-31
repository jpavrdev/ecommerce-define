import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './index.js';
import { Product } from './Product.js';
import { User } from './User.js';

export interface ProductRatingAttributes {
  id: number;
  productId: number;
  userId: number;
  rating: number; // 1..5
  comment?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type ProductRatingCreation = Optional<ProductRatingAttributes, 'id' | 'comment' | 'createdAt' | 'updatedAt'>;

export class ProductRating extends Model<ProductRatingAttributes, ProductRatingCreation> implements ProductRatingAttributes {
  public id!: number;
  public productId!: number;
  public userId!: number;
  public rating!: number;
  public comment!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProductRating.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    rating: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false, validate: { min: 1, max: 5 } },
    comment: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, tableName: 'product_ratings', indexes: [{ fields: ['productId'] }, { fields: ['userId'] }, { unique: true, fields: ['productId', 'userId'] }] }
);

Product.hasMany(ProductRating, { foreignKey: 'productId', as: 'ratings' });
ProductRating.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
User.hasMany(ProductRating, { foreignKey: 'userId', as: 'ratings' });
ProductRating.belongsTo(User, { foreignKey: 'userId', as: 'user' });

