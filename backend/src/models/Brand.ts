import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './index.js';

export interface BrandAttributes {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type BrandCreationAttributes = Optional<BrandAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class Brand extends Model<BrandAttributes, BrandCreationAttributes> implements BrandAttributes {
  public id!: number;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Brand.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(160),
      allowNull: false,
      unique: true,
    },
  },
  { sequelize, tableName: 'brands' }
);

