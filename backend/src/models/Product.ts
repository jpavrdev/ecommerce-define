import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './index.js';
import { Brand } from './Brand.js';
import { Category } from './Category.js';

export interface ProductAttributes {
  id: number;
  name: string;
  sku: string;
  price: string; // stored as DECIMAL string
  description?: string | null;
  characteristics?: any | null; // JSON
  specifications?: any | null; // JSON
  imageUrl?: string | null;
  imageData?: Buffer | null;
  imageMimeType?: string | null;
  images?: any | null; // JSON array of URLs
  brandId?: number | null;
  categoryId?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type ProductCreationAttributes = Optional<
  ProductAttributes,
  'id' | 'description' | 'characteristics' | 'specifications' | 'brandId' | 'createdAt' | 'updatedAt'
>;

export class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: number;
  public name!: string;
  public sku!: string;
  public price!: string;
  public description!: string | null;
  public characteristics!: any | null;
  public specifications!: any | null;
  public imageUrl!: string | null;
  public imageData!: Buffer | null;
  public imageMimeType!: string | null;
  public images!: any | null;
  public brandId!: number | null;
  public categoryId!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(240),
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    characteristics: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    specifications: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
    imageData: {
      type: DataTypes.BLOB('long'),
      allowNull: true,
    },
    imageMimeType: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    brandId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: 'brands', key: 'id' },
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'categories', key: 'id' },
    },
  },
  { sequelize, tableName: 'products', indexes: [{ unique: true, fields: ['sku'] }, { fields: ['name'] }] }
);

Brand.hasMany(Product, { foreignKey: 'brandId', as: 'products' });
Product.belongsTo(Brand, { foreignKey: 'brandId', as: 'brand' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
