import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './index.js';

export interface CategoryAttributes {
  id: number;
  name: string;
  slug: string;
  parentId?: number | null;
  order?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type CategoryCreation = Optional<CategoryAttributes, 'id' | 'createdAt' | 'updatedAt' | 'parentId' | 'order'>;

export class Category extends Model<CategoryAttributes, CategoryCreation> implements CategoryAttributes {
  public id!: number;
  public name!: string;
  public slug!: string;
  public parentId!: number | null;
  public order!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Category.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(160), allowNull: false },
    slug: { type: DataTypes.STRING(180), allowNull: false, unique: true },
    parentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    order: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, tableName: 'categories', indexes: [{ fields: ['parentId'] }, { fields: ['order'] }, { unique: true, fields: ['slug'] }] }
);

Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

