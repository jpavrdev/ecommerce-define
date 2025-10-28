import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './index.js';

interface PasswordResetTokenAttributes {
  id: number;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type PasswordResetTokenCreation = Optional<
  PasswordResetTokenAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'usedAt'
>;

export class PasswordResetToken
  extends Model<PasswordResetTokenAttributes, PasswordResetTokenCreation>
  implements PasswordResetTokenAttributes
{
  public id!: number;
  public userId!: number;
  public tokenHash!: string;
  public expiresAt!: Date;
  public usedAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PasswordResetToken.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    tokenHash: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'password_reset_tokens',
    indexes: [
      { fields: ['userId'] },
      { unique: true, fields: ['tokenHash'] },
      { fields: ['expiresAt'] },
    ],
  }
);

